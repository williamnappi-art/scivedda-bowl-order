// ── Stampante locale (solo sul kiosk in cucina) ────────────────────────────
//
// Sul Raspberry Pi la dashboard è servita dallo stesso programma che pilota
// la stampante (http://localhost:3999). Quando siamo lì, il clic "Conferma"
// consegna l'ordine alla stampante direttamente, senza passare dal cloud:
// ticket in ~1 secondo, e funziona anche se internet è giù.
// Su telefono/PC questo modulo è semplicemente "non disponibile".

const RECENT_MS = 30 * 1000; // una richiesta piu' vecchia (rete che era giu') non si stampa da sola
const HEALTH_TTL_MS = 30_000;

const isKiosk = typeof window !== "undefined" && /^http:\/\/localhost(:\d+)?$/.test(window.location.origin);

let healthCheckedAt = 0;
let healthy = false;

async function fetchWithTimeout(url, opts = {}, ms = 1500) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { ...opts, signal: ctrl.signal }); }
  finally { clearTimeout(t); }
}

export async function isLocalPrinterAvailable() {
  if (!isKiosk) return false;
  if (Date.now() - healthCheckedAt < HEALTH_TTL_MS) return healthy;
  try {
    const r = await fetchWithTimeout("/health");
    healthy = r.ok;
  } catch { healthy = false; }
  healthCheckedAt = Date.now();
  return healthy;
}

/** Consegna un ordine alla stampante locale. Ritorna true se stampato. */
export async function printLocal(order) {
  if (!(await isLocalPrinterAvailable())) return false;
  try {
    const r = await fetchWithTimeout("/print", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    }, 4000);
    if (!r.ok) return false;
    const j = await r.json().catch(() => ({}));
    return j.printed === true || j.duplicate === true;
  } catch { return false; }
}

/**
 * Inoltra alla stampante le richieste di stampa "vive" (ultimi 30 s) tra gli
 * ordini appena sincronizzati: e' cosi' che un clic fatto dal telefono
 * stampa in cucina. Richieste piu' vecchie (arretrate dopo un blackout) non
 * si stampano mai da sole: si clicca RISTAMPA. Il Pi scarta i doppioni.
 */
export function forwardRecentPrintRequests(orders) {
  if (!isKiosk || !orders?.length) return;
  const cutoff = Date.now() - RECENT_MS;
  for (const o of orders) {
    if (o.print_requested_at && new Date(o.print_requested_at).getTime() >= cutoff) printLocal(o);
  }
}
