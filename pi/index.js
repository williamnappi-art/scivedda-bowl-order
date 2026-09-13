// ── Scivedda — servizio cucina sul Raspberry Pi ────────────────────────────
//
// Fa tre cose, tutte locali:
//   1. Serve la dashboard al kiosk (http://localhost:3999) facendo da tramite
//      verso Vercel, così dashboard e stampante sono la stessa "casa" e il
//      clic "Conferma" arriva alla stampante senza passare dal cloud.
//   2. Riceve gli ordini da stampare (POST /print) e li stampa subito.
//   3. Riserva: ogni 60 s chiede al cloud se ci sono richieste di stampa non
//      ancora evase (es. conferma dal telefono col kiosk chiuso).
//
// Mai doppie stampe: ogni stampa è annotata su file con chiave
// "id ordine | istante della richiesta", da qualunque via arrivi.
//
// Credenziali: in /home/scivedda/printer/config.json (solo sul Pi, mai su git)
//   { "supabaseUrl": "https://….supabase.co", "supabaseKey": "sb_secret_…" }

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const http = require("http");
const https = require("https");

const DIR = "/home/scivedda/printer";
const CONFIG = JSON.parse(fs.readFileSync(DIR + "/config.json", "utf8"));
const PRINTER = "/dev/usb/lp0";
const PORT = 3999;
const APP_ORIGIN = "https://scivedda-bowl-order.vercel.app";
const STATE_FILE = DIR + "/state.json";
const BACKSTOP_MS = 60 * 1000;          // riserva: ogni 60 s
const CATCHUP_MS = 10 * 60 * 1000;      // al primo avvio recupera gli ultimi 10 min
const MAX_KEYS = 500;

const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
const log = (...a) => console.log("[" + new Date().toISOString() + "]", ...a);

// ── Memoria di cosa è già stato stampato ───────────────────────────────────
function loadState() {
  try {
    const s = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    return { watermark: s.watermark || null, keys: new Set(s.keys || []) };
  } catch {
    return { watermark: null, keys: new Set() };
  }
}
function saveState() {
  const keys = [...state.keys].slice(-MAX_KEYS);
  state.keys = new Set(keys);
  fs.writeFileSync(STATE_FILE, JSON.stringify({ watermark: state.watermark, keys }));
}
const state = loadState();
if (!state.watermark) state.watermark = new Date(Date.now() - CATCHUP_MS).toISOString();

// ── Ticket (identico al programma precedente) ──────────────────────────────
const INGREDIENT_NAMES = {
  "fregola": "Fregula Sarda",
  "riso-bianco": "Riso Bianco di Oristano",
  "riso-rosso": "Riso Rosso Integrale",
  "riso-nero": "Riso Nero Integrale",
  "farro": "Farro di Sardegna",
  "insalata": "Insalata di Stagione",
  "riso-insalata": "Riso + Insalata",
  "fregola-insalata": "Fregula + Insalata",
  "salmone-crudo": "Salmone Crudo",
  "salmone-cotto": "Salmone Cotto",
  "tonno-crudo": "Tonno Crudo",
  "tonno-cotto": "Tonno Cotto",
  "gambero-cotto": "Gambero Cotto",
  "polpo": "Polpo Tradizionale",
  "uovo-pula": "Uovo Morbido di Pula",
  "maiale-sfilacciato": "Maiale Sfilacciato",
  "polletto": "Polletto Ruspante",
  "tofu-naturale": "Tofu Naturale",
  "legumi": "Legumi del Campidano",
  "avocado": "Avocado",
  "cipolla-rossa": "Cipolla Rossa",
  "olive-parteolla": "Olive del Parteolla",
  "cetriolo": "Cetriolo",
  "frutta-stagione": "Frutta di Stagione",
  "pomodorini-pula": "Pomodorini di Pula",
  "edamame": "Edamame",
  "ananas": "Ananas",
  "mais": "Mais",
  "jalapeno": "Jalapeno",
  "mango": "Mango",
  "carote": "Carote",
  "ceci": "Ceci",
  "zucchina-fritta": "Zucchina Fritta",
  "cavolo-viola": "Cavolo Viola",
  "finocchio": "Finocchio",
  "verdura-stagione": "Verdura di Stagione",
  "pomodoro-secco": "Pomodoro Secco",
  "chips-cipolla": "Chips di Cipolla",
  "semi-zucca": "Semi di Zucca",
  "sesamo": "Sesamo",
  "zenzero-rosa": "Zenzero Rosa",
  "noci": "Noci",
  "mandorle": "Mandorle",
  "semi-canapa": "Semi di Canapa",
  "anacardi": "Anacardi",
  "pistacchio": "Pistacchio",
  "kataifi": "Kataifi",
  "soia": "Soia",
  "wasabi-maio": "Wasabi Maio",
  "sale-zenzero": "Sale allo Zenzero",
  "teriyaki": "Teriyaki",
  "zenzero-maio": "Zenzero Maio",
  "spicy-maio": "Spicy Maio",
  "yogurt-dressing": "Yogurt Dressing",
  "maio-tartufo": "Maionese Tartufo",
  "olio-evo": "Olio EVO",
  "sale": "Sale",
  "wasabi": "Wasabi",
  "caprino": "Caprino Fresco",
  "cipolla-cara": "Cipolla Caramellata",
  "ricotta-mustia": "Ricotta Mustia",
  "philadelphia": "Philadelphia",
  "bufala": "Mozzarella di Bufala",
  "casu-axedu": "Casu Axedu",
  "bottarga": "Bottarga",
  "wakame": "Alga Wakame",
  "pane-guttiau": "Pane Guttiau",
  "alga-nori": "Alga Nori Essiccata",
  "aceto-balsamico": "Aceto Balsamico"
};

function resolveDetails(details) {
  if (!details) return [];
  const portionsMap = details.portions || {};
  const sections = [
    { key: "size", label: "TAGLIA" },
    { key: "basi", label: "BASE" },
    { key: "proteine", label: "PROTEINE" },
    { key: "verdure", label: "VERDURE" },
    { key: "croccanti", label: "CROCCANTI" },
    { key: "salse", label: "SALSE" },
    { key: "special", label: "SPECIAL" },
  ];
  const result = [];
  sections.forEach(({ key, label }) => {
    const val = details[key];
    if (!val || (Array.isArray(val) && !val.length)) return;
    const value = key === "size"
      ? val.toUpperCase()
      : val.map(id => {
          const name = (INGREDIENT_NAMES[id] || id).toUpperCase();
          const p = portionsMap[`${key}_${id}`] || 1;
          return p === 2 ? `${name} (X2)` : name;
        }).join(", ");
    result.push({ label, value });
  });
  return result;
}

function buildTicket(order) {
  const INIT        = "\x1b\x40";
  const DENSITY     = "\x1d\x7c\x08";  // densità stampa massima (GS |)
  const DBL_STRIKE  = "\x1b\x47\x01";  // double-strike: ogni punto stampato 2 volte → più scuro
  const CENTER    = "\x1b\x61\x01";
  const LEFT      = "\x1b\x61\x00";
  const BOLD_ON   = "\x1b\x45\x01";
  const BOLD_OFF  = "\x1b\x45\x00";
  const BIG_ON    = "\x1b\x21\x30"; // doppia altezza + larghezza
  const BIG_OFF   = "\x1b\x21\x00";
  const TALL_ON   = "\x1b\x21\x10"; // doppia altezza
  const TALL_OFF  = "\x1b\x21\x00";
  const CUT       = "\x1d\x56\x41\x10";
  const SEP       = BOLD_ON + "------------------------\n" + BOLD_OFF;

  const time = new Date(order.created_at).toLocaleString("it-IT", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
  });

  const bowls = [];
  (order.order_items || []).forEach(item => {
    for (let i = 0; i < (item.qty || 1); i++) bowls.push(item);
  });

  return bowls.map((item, idx) => {
    let t = INIT + DENSITY + DBL_STRIKE + BOLD_ON;
    // Codice ordine — massimo
    t += CENTER + BIG_ON + (order.order_code || "—") + "\n" + BIG_OFF;
    // Bowl n di tot
    t += TALL_ON + "BOWL " + (idx + 1) + " DI " + bowls.length + "\n" + TALL_OFF;
    t += SEP;
    // Nome cliente
    t += LEFT + BIG_ON + (order.customer_name || "Cliente").toUpperCase() + "\n" + BIG_OFF;
    if (order.dining_option === "qui") t += TALL_ON + ">> MANGIO QUI <<\n" + TALL_OFF;
    if (order.dining_option === "via") t += TALL_ON + ">> PORTO VIA <<\n" + TALL_OFF;
    t += TALL_ON + time + "\n" + TALL_OFF;
    t += SEP;
    // Nome piatto
    t += BIG_ON + item.item_name.toUpperCase() + "\n" + BIG_OFF;
    t += "\n";
    // Ricetta piatti da menù (Le nostre Scivedde)
    if (item.item_type !== "custom" && item.details && item.details.recipe) {
      t += TALL_ON + "INGREDIENTI:\n" + TALL_OFF;
      t += TALL_ON + item.details.recipe.toUpperCase() + "\n" + TALL_OFF;
      t += "\n";
    }
    // Ingredienti custom
    if (item.item_type === "custom" && item.details) {
      resolveDetails(item.details).forEach(({ label, value }) => {
        t += TALL_ON + label + ":\n" + TALL_OFF;
        t += BIG_ON + value + "\n" + BIG_OFF;
        t += "\n";
      });
    }
    if (order.customer_note) {
      t += SEP;
      t += TALL_ON + "NOTA: " + order.customer_note.toUpperCase() + "\n" + TALL_OFF;
    }
    t += "\n\n\n\n" + CUT;
    return t;
  }).join("");
}

function printOrder(order) {
  const ticket = buildTicket(order);
  if (!ticket) return false;
  try {
    fs.writeFileSync(PRINTER, ticket, "binary");
    return true;
  } catch (err) {
    console.error("Errore stampa:", err.message);
    return false;
  }
}

// Stampa solo se questa richiesta (ordine + istante) non è già stata evasa.
function printIfNew(order, source) {
  const ts = order.print_requested_at || new Date().toISOString();
  const key = order.id + "|" + ts;
  if (state.keys.has(key)) return { printed: false, duplicate: true };
  if (!printOrder(order)) return { printed: false, duplicate: false };
  state.keys.add(key);
  if (ts > state.watermark) state.watermark = ts;
  saveState();
  log("Stampato (" + source + "): " + (order.order_code || "—") + " — " + (order.customer_name || "Cliente"));
  return { printed: true, duplicate: false };
}

// ── Riserva: richieste di stampa non ancora evase ─────────────────────────
// Guarda solo indietro di CATCHUP_MS (10 min): se il Pi resta senza rete per
// ore, al ritorno NON sputa i ticket di tutta la giornata. Per i più vecchi
// c'è il tasto "Stampa ordine".
async function backstop() {
  try {
    const floor = new Date(Date.now() - CATCHUP_MS).toISOString();
    const since = state.watermark > floor ? state.watermark : floor;
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .gt("print_requested_at", since)
      .order("print_requested_at", { ascending: true });
    if (error) { console.error("Riserva:", error.message); return; }
    for (const order of data || []) printIfNew(order, "riserva");
    if (since > state.watermark) { state.watermark = since; saveState(); }
  } catch (e) {
    console.error("Riserva:", e.message);
  }
}

// ── Server locale: dashboard (tramite) + stampa ────────────────────────────
function send(res, code, body, type = "application/json; charset=utf-8") {
  res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
}

const WAIT_PAGE = '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="5">' +
  '<body style="margin:0;font-family:sans-serif;display:flex;height:100vh;align-items:center;justify-content:center;background:#faf7f2;color:#666">' +
  '<div style="text-align:center"><div style="font-size:40px">🥣</div>Connessione in corso… riprovo tra 5 secondi</div></body>';

const DROP_HEADERS = ["strict-transport-security", "alt-svc"];

function proxy(req, res) {
  const headers = { ...req.headers, host: new URL(APP_ORIGIN).host };
  const up = https.request(APP_ORIGIN + req.url, { method: req.method, headers }, (r) => {
    const h = { ...r.headers };
    for (const k of DROP_HEADERS) delete h[k];
    res.writeHead(r.statusCode, h);
    r.pipe(res);
  });
  up.setTimeout(15000, () => up.destroy(new Error("timeout")));
  up.on("error", () => { if (!res.headersSent) send(res, 503, WAIT_PAGE, "text/html; charset=utf-8"); else res.end(); });
  req.pipe(up);
}

const server = http.createServer((req, res) => {
  const path = (req.url || "/").split("?")[0];

  if (req.method === "GET" && path === "/health") {
    return send(res, 200, JSON.stringify({ ok: true, printer: fs.existsSync(PRINTER) }));
  }

  if (req.method === "POST" && path === "/print") {
    let body = "";
    req.on("data", (c) => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on("end", () => {
      try {
        const { order } = JSON.parse(body);
        if (!order || !order.id) return send(res, 400, '{"error":"ordine mancante"}');
        return send(res, 200, JSON.stringify(printIfNew(order, "kiosk")));
      } catch (e) {
        return send(res, 400, JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  proxy(req, res);
});

process.on("uncaughtException", (e) => console.error("Errore inatteso:", e));
process.on("unhandledRejection", (e) => console.error("Errore inatteso:", e));

server.listen(PORT, "127.0.0.1", () => {
  log("Servizio cucina avviato su http://localhost:" + PORT + " — riserva ogni " + BACKSTOP_MS / 1000 + "s, segnalibro " + state.watermark);
  backstop();
  setInterval(backstop, BACKSTOP_MS);
});
