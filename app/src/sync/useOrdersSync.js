// ── Sincronizzazione ordini per la dashboard cucina ────────────────────────
//
// Principio: nessuno scarica mai "tutto" a ripetizione.
//   1. All'apertura: un solo carico completo (ultime 48h).
//   2. Poi si resta in ascolto del "citofono" (Realtime Broadcast, non tocca
//      il DB): chi modifica un ordine suona, chi ascolta chiede solo
//      "cos'è cambiato dopo l'ultimo istante che conosco?" (updated_at).
//   3. Rete di sicurezza: la stessa domanda parte anche a orologio —
//      ogni 60 s se il citofono è collegato, ogni 3 s se non lo è —
//      e ogni volta che la pagina torna in primo piano.
//
// Costo tipico: una risposta vuota (~0,6 KB) al minuto per dispositivo.

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";

export const ORDERS_CHANNEL = "scivedda-orders";
const SELECT = "*, order_items(*)";
const WINDOW_MS = 48 * 60 * 60 * 1000;
const SAFETY_LIVE_MS = 60_000;
const SAFETY_FALLBACK_MS = 3_000;
const MAX_ORDERS = 200;

const PENDING_KEY = "scivedda_pending_updates";

const sinceIso = () => new Date(Date.now() - WINDOW_MS).toISOString();

// Scritture che non hanno raggiunto il cloud (rete giù): restano in coda su
// disco e vengono rispedite appena possibile. Così un "Conferma" fatto
// offline stampa subito E arriva al database quando la rete torna.
const loadPending = () => { try { return JSON.parse(localStorage.getItem(PENDING_KEY)) || []; } catch { return []; } };
const savePending = (q) => { try { localStorage.setItem(PENDING_KEY, JSON.stringify(q)); } catch { /* best-effort */ } };

async function pushUpdate(id, patch) {
  const { error } = await supabase.from("orders").update(patch).eq("id", id);
  if (error) throw error;
}

let flushing = false;
async function flushPending() {
  if (flushing) return;
  const queue = loadPending();
  if (!queue.length) return;
  flushing = true;
  try {
    for (const item of queue) {
      await pushUpdate(item.id, item.patch);
      savePending(loadPending().filter(x => x.key !== item.key));
    }
    notifyOrdersChanged();
  } catch { /* ancora offline: riprovo al prossimo giro */ }
  finally { flushing = false; }
}
const byNewest = (a, b) => (a.created_at < b.created_at ? 1 : -1);

/**
 * Suona il citofono: avvisa tutti i dispositivi in ascolto che qualcosa è
 * cambiato. Se questo dispositivo ha il canale aperto usa quello, altrimenti
 * una singola chiamata HTTP (nessuna connessione persistente richiesta —
 * è il caso del telefono del cliente). Fire-and-forget: se fallisce, la rete
 * di sicurezza recupera comunque.
 */
export function notifyOrdersChanged() {
  try {
    const channel = supabase.channel(ORDERS_CHANNEL, { config: { broadcast: { self: true } } });
    return channel
      .send({ type: "broadcast", event: "changed", payload: {} }, { timeout: 1500 })
      .catch(() => "error");
  } catch {
    return Promise.resolve("error");
  }
}

/**
 * @param {boolean} enabled   attivo solo con dashboard aperta e admin loggato
 * @param {(changed: object[]) => void} [onChanged]  chiamato con gli ordini
 *        appena caricati/cambiati (usato dal kiosk per inoltrare le stampe)
 */
export function useOrdersSync(enabled, onChanged) {
  const [orders, setOrders] = useState([]);
  const [live, setLive] = useState(false);

  const mapRef = useRef(new Map());        // id → ordine
  const watermarkRef = useRef(null);       // max updated_at visto
  const inFlightRef = useRef(false);
  const pendingRef = useRef(false);
  const onChangedRef = useRef(onChanged);
  onChangedRef.current = onChanged;

  const publish = useCallback(() => {
    const cutoff = sinceIso();
    for (const [id, o] of mapRef.current) if (o.created_at < cutoff) mapRef.current.delete(id);
    setOrders([...mapRef.current.values()].sort(byNewest).slice(0, MAX_ORDERS));
  }, []);

  const merge = useCallback((rows) => {
    if (!rows?.length) return;
    for (const o of rows) {
      mapRef.current.set(o.id, o);
      if (o.updated_at && (!watermarkRef.current || o.updated_at > watermarkRef.current)) {
        watermarkRef.current = o.updated_at;
      }
    }
    publish();
    onChangedRef.current?.(rows);
  }, [publish]);

  // "Cos'è cambiato?" — carico completo la prima volta, incrementale poi.
  const fetchChanges = useCallback(async () => {
    if (!enabled) return;
    if (inFlightRef.current) { pendingRef.current = true; return; }
    inFlightRef.current = true;
    try {
      await flushPending();
      let q = supabase.from("orders").select(SELECT).gte("created_at", sinceIso());
      q = watermarkRef.current
        ? q.gt("updated_at", watermarkRef.current).order("updated_at", { ascending: true })
        : q.order("created_at", { ascending: false }).limit(MAX_ORDERS);
      const { data, error } = await q;
      if (error) { console.error("Sync ordini:", error.message); return; }
      if (!watermarkRef.current && !data?.length) {
        // Nessun ordine nelle 48h: parto da "adesso" per non ricaricare tutto ogni volta
        watermarkRef.current = new Date().toISOString();
      }
      merge(data);
    } catch (e) {
      console.error("Sync ordini:", e?.message || e);
    } finally {
      inFlightRef.current = false;
      if (pendingRef.current) { pendingRef.current = false; fetchChanges(); }
    }
  }, [enabled, merge]);

  // Aggiornamento locale immediato (la UI non aspetta il cloud)
  const applyLocal = useCallback((id, patch) => {
    const cur = mapRef.current.get(id);
    if (!cur) return;
    mapRef.current.set(id, { ...cur, ...patch });
    publish();
  }, [publish]);

  // Unica via per modificare un ordine: locale subito, cloud (con coda se
  // offline), poi citofono per gli altri dispositivi.
  const updateOrder = useCallback(async (id, patch) => {
    applyLocal(id, patch);
    try {
      await flushPending();
      await pushUpdate(id, patch);
      notifyOrdersChanged();
    } catch {
      const q = loadPending();
      q.push({ key: id + "|" + Date.now(), id, patch });
      savePending(q);
    }
  }, [applyLocal]);

  // Ciclo di vita: carico iniziale + citofono + sicurezza + visibilità
  useEffect(() => {
    if (!enabled) {
      mapRef.current = new Map();
      watermarkRef.current = null;
      setOrders([]);
      setLive(false);
      return;
    }

    let disposed = false;
    let timer = null;
    let isLive = false;

    const schedule = () => {
      clearInterval(timer);
      timer = setInterval(fetchChanges, isLive ? SAFETY_LIVE_MS : SAFETY_FALLBACK_MS);
    };

    fetchChanges();

    const channel = supabase
      .channel(ORDERS_CHANNEL, { config: { broadcast: { self: true } } })
      .on("broadcast", { event: "changed" }, () => fetchChanges())
      .subscribe((status) => {
        if (disposed) return;
        const nowLive = status === "SUBSCRIBED";
        if (nowLive && !isLive) fetchChanges(); // riconnesso: recupera l'eventuale perso
        isLive = nowLive;
        setLive(nowLive);
        schedule();
      });
    schedule();

    const onVisible = () => { if (document.visibilityState === "visible") fetchChanges(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", fetchChanges);

    return () => {
      disposed = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", fetchChanges);
      supabase.removeChannel(channel);
    };
  }, [enabled, fetchChanges]);

  return { orders, live, refresh: fetchChanges, applyLocal, updateOrder };
}
