import React, { useState, useEffect, useRef, useTransition } from "react";
import { supabase } from "./supabase";

// ── Menu Data (in production, this comes from admin panel / API) ──────────
const MENU_CATEGORIES = {
  basi: {
    label: "Base",
    emoji: "🍚",
    color: "#f5e6d3",
    items: [
      { id: "fregola", name: "Fregula Sarda", cal: 150, icon: "🟤", cardImage: "/basi-fregola.gif" },
      { id: "riso-bianco", name: "Riso Bianco di Oristano", cal: 130, icon: "🍚", cardImage: "/basi-riso-bianco.gif" },
      { id: "riso-rosso", name: "Riso Rosso Integrale di Oristano", cal: 125, icon: "🔴", cardImage: "/basi-riso-rosso.gif" },
      { id: "riso-nero", name: "Riso Nero Integrale di Oristano", cal: 120, icon: "⚫", cardImage: "/basi-riso-nero.gif" },
      { id: "farro", name: "Farro di Sardegna", cal: 140, icon: "🌾", cardImage: "/basi-farro.gif" },
      { id: "insalata", name: "Insalata di Stagione", cal: 20, icon: "🥬", cardImage: "/basi-insalata.gif" },
      { id: "riso-insalata", name: "Riso + Insalata", cal: 90, icon: "🍱", cardImage: "/basi-riso-insalata.gif" },
      { id: "fregola-insalata", name: "Fregula + Insalata", cal: 95, icon: "🥗", cardImage: "/basi-fregola-insalata.gif" },
    ],
  },
  proteine: {
    label: "Proteina",
    emoji: "🐟",
    color: "#ffd6d6",
    items: [
      { id: "salmone-crudo",   name: "Salmone Crudo",        cal: 180, icon: "🍣" },
      { id: "salmone-cotto",   name: "Salmone Cotto",        cal: 170, icon: "🐟" },
      { id: "tonno-crudo",     name: "Tonno Crudo",          cal: 160, icon: "🔴" },
      { id: "tonno-cotto",     name: "Tonno Cotto",          cal: 150, icon: "🫙" },
      { id: "gambero-cotto",   name: "Gambero Cotto",        cal: 100, icon: "🦐", extra: 2 },
      { id: "polpo",           name: "Polpo Tradizionale",   cal: 120, icon: "🐙", extra: 3 },
      { id: "uovo-pula",       name: "Uovo Morbido di Pula", cal: 90,  icon: "🥚" },
      { id: "maiale-sfilacciato", name: "Maiale Sfilacciato", cal: 200, icon: "🥩", extra: 3 },
      { id: "polletto",        name: "Polletto Ruspante",    cal: 170, icon: "🍗" },
      { id: "tofu-naturale",   name: "Tofu Naturale",        cal: 90,  icon: "🧈" },
      { id: "legumi",          name: "Legumi del Campidano", cal: 130, icon: "🫘" },
    ],
  },
  verdure: {
    label: "Verdure & Frutta",
    emoji: "🥑",
    color: "#d4edda",
    items: [
      { id: "avocado",           name: "Avocado",              cal: 80,  icon: "🥑", extra: 1.5 },
      { id: "cipolla-rossa",     name: "Cipolla Rossa",        cal: 10,  icon: "🧅", cardImage: "/verdure-cipolla-rossa.gif" },
      { id: "olive-parteolla",   name: "Olive del Parteolla",  cal: 40,  icon: "🫒" },
      { id: "cetriolo",          name: "Cetriolo",             cal: 15,  icon: "🥒" },
      { id: "frutta-stagione",   name: "Frutta di Stagione",   cal: 50,  icon: "🍓", cardImage: "/verdure-frutta-stagione.gif" },
      { id: "pomodorini-pula",   name: "Pomodorini di Pula",   cal: 18,  icon: "🍅", cardImage: "/verdure-pomodorini.gif" },
      { id: "edamame",           name: "Edamame",              cal: 120, icon: "🫛" },
      { id: "ananas",            name: "Ananas",               cal: 40,  icon: "🍍" },
      { id: "mais",              name: "Mais",                 cal: 35,  icon: "🌽" },
      { id: "jalapeno",          name: "Jalapeño",             cal: 5,   icon: "🌶️" },
      { id: "mango",             name: "Mango",                cal: 60,  icon: "🥭", extra: 1 },
      { id: "carote",            name: "Carote",               cal: 20,  icon: "🥕" },
      { id: "ceci",              name: "Ceci",                 cal: 130, icon: "🫘" },
      { id: "zucchina-fritta",   name: "Zucchina Fritta",      cal: 70,  icon: "🥬", extra: 1.5 },
      { id: "cavolo-viola",      name: "Cavolo Viola",         cal: 25,  icon: "🫐" },
      { id: "finocchio",         name: "Finocchio",            cal: 20,  icon: "🌿", cardImage: "/verdure-finocchio.gif" },
      { id: "verdura-stagione",  name: "Verdura di Stagione",  cal: 30,  icon: "🥦", extra: 1.5 },
      { id: "pomodoro-secco",    name: "Pomodoro Secco",       cal: 45,  icon: "🔴" },
    ],
  },
  croccanti: {
    label: "Croccanti",
    emoji: "✨",
    color: "#fdf3e3",
    items: [
      { id: "chips-cipolla",   name: "Chips di Cipolla",  cal: 45,  icon: "🧅" },
      { id: "semi-zucca",      name: "Semi di Zucca",     cal: 35,  icon: "🎃" },
      { id: "sesamo",          name: "Sesamo",            cal: 20,  icon: "⬜" },
      { id: "zenzero-rosa",    name: "Zenzero Rosa",      cal: 10,  icon: "🌸", extra: 0.5 },
      { id: "noci",            name: "Noci",              cal: 65,  icon: "🫘" },
      { id: "mandorle",        name: "Mandorle",          cal: 60,  icon: "🌰" },
      { id: "semi-canapa",     name: "Semi di Canapa",    cal: 30,  icon: "🌿" },
      { id: "anacardi",        name: "Anacardi",          cal: 55,  icon: "🥜", extra: 0.5 },
      { id: "pistacchio",      name: "Pistacchio",        cal: 60,  icon: "💚", extra: 0.5 },
      { id: "kataifi",         name: "Kataifi",           cal: 50,  icon: "🥐", extra: 1 },
    ],
  },
  salse: {
    label: "Salsa",
    emoji: "🫗",
    color: "#fff3cd",
    items: [
      { id: "soia",              name: "Soia",                  cal: 10, icon: "🫗" },
      { id: "wasabi-maio",       name: "Wasabi Maio",           cal: 40, icon: "🟢" },
      { id: "sale-zenzero",      name: "Sale allo Zenzero",     cal: 5,  icon: "🧂" },
      { id: "teriyaki",          name: "Teriyaki",              cal: 25, icon: "🍯" },
      { id: "zenzero-maio",      name: "Zenzero Maio",          cal: 40, icon: "🫚" },
      { id: "spicy-maio",        name: "Spicy Maio",            cal: 45, icon: "🌶️" },
      { id: "yogurt-dressing",   name: "Yogurt Dressing",       cal: 35, icon: "🥛" },
      { id: "maio-tartufo",      name: "Maionese Tartufo",      cal: 50, icon: "🍄", extra: 0.5 },
      { id: "olio-evo",          name: "Olio EVO",              cal: 90, icon: "🫒" },
      { id: "sale",              name: "Sale",                  cal: 0,  icon: "🧂" },
      { id: "wasabi",            name: "Wasabi",                cal: 5,  icon: "🌿" },
    ],
  },
  special: {
    label: "Special",
    emoji: "⭐",
    color: "#f0e6f6",
    items: [
      { id: "caprino",       name: "Caprino Fresco",                      cal: 70,  icon: "🧀", extra: 1 },
      { id: "cipolla-cara",  name: "Cipolla Caramellata",                 cal: 55,  icon: "🧅", extra: 1 },
      { id: "ricotta-mustia",name: "Ricotta Mustia",                      cal: 80,  icon: "🔶", extra: 1 },
      { id: "philadelphia",  name: "Philadelphia",                        cal: 90,  icon: "🫙", extra: 1 },
      { id: "bufala",        name: "Mozzarella di Bufala",                cal: 100, icon: "🫗", extra: 1 },
      { id: "casu-axedu",    name: "Casu Axedu",                         cal: 65,  icon: "🍶", extra: 1 },
      { id: "bottarga",      name: "Bottarga",                           cal: 40,  icon: "🟠", extra: 1 },
      { id: "wakame",        name: "Alga Wakame",                        cal: 15,  icon: "🌿", extra: 1 },
      { id: "pane-guttiau",  name: "Pane Guttiau",                       cal: 60,  icon: "🫓", extra: 1 },
    ],
  },
};

const ALLERGEN_LABELS = {
  glutine: "🌾 Glutine", uova: "🥚 Uova", latte: "🥛 Latte",
  pesce: "🐟 Pesce", crostacei: "🦐 Crostacei", soia: "🫘 Soia",
  sesamo: "⬜ Sesamo", fruttaGuscio: "🌰 Frutta a guscio",
  sedano: "🌿 Sedano", solfiti: "🍷 Solfiti", molluschi: "🦪 Molluschi",
  arachidi: "🥜 Arachidi", senape: "🌼 Senape",
};

const MENU_SECTIONS = [
  {
    id: "brodu",
    label: "Brodu",
    subtitle: "Brodi e minestre tradizionali, reinterpretate",
    emoji: "🫕",
    items: [
      { id: "brodu-berbeghe", name: "Brodu de Puddha", desc: "Fregula tradizionale tostata in Brodo semplice di Polletto ruspante, Manzo e Maiale. Servito con carne di maiale sfilacciata nella sua salsa d'arrosto e verdure cotte di stagione.", price: 16.00, allergens: ["glutine", "sedano", "soia"], vegetarian: false, vegan: false, image: "/brodo-scivedda.svg" },
      { id: "brodu-puddha", name: "Brodu 'e Puddha", desc: "Brodo di gallina ruspante con verdure di stagione, zafferano di Sardegna e fregola piccola. Un classico della domenica sarda.", price: 7.50, allergens: ["glutine", "sedano"], vegetarian: false, vegan: false },
      { id: "fregola-arselle", name: "Fregula con le Arselle", desc: "Fregula sarda tostata con vongole veraci, pomodorino, aglio e prezzemolo. Il mare della Sardegna in un piatto.", price: 12.00, allergens: ["glutine", "molluschi", "sedano"], vegetarian: false, vegan: false },
      { id: "minestra-verdure", name: "Minestra di Verdure", desc: "Minestrone ricco con legumi sardi, verdure dell'orto e un giro d'olio extravergine. Semplice, nutriente, vegan.", price: 7.00, allergens: ["sedano"], vegetarian: true, vegan: true },
    ],
  },
  {
    id: "special",
    label: "Special del Giorno",
    subtitle: "Cosa bolle in pentola? Guarda un po' cosa abbiamo oggi!",
    emoji: "⭐",
    items: [
      { id: "special-today", name: "Il Piatto del Giorno", desc: "Ogni giorno una sorpresa. Cambia ogni giorno in base alla stagione e all'umore dello chef. Chiedi al banco per ingredienti e prezzo.", price: null, allergens: [], vegetarian: null, vegan: null },
      { id: "zuppa-ceci", name: "Zuppa di Ceci e Rosmarino", desc: "Ceci sardi cotti con rosmarino, aglio, olio e peperoncino. Servita con crostoni di pane carasau. Oggi questo!", price: 9.00, allergens: ["glutine"], vegetarian: true, vegan: true },
    ],
  },
  {
    id: "scivedde",
    label: "Le nostre Scivedde",
    subtitle: "La scivedda sarda, la tradizione incontra altre culture",
    emoji: "🥣",
    items: [
      { id: "scivedda-sarda", name: "Scivedda Sarda", desc: "Riso bianco, salmone fresco, avocado, wakame, cetriolo, salsa di soia e semi di sesamo. Il nostro classico.", price: 11.90, allergens: ["pesce", "sesamo", "soia"], vegetarian: false, vegan: false, popular: true },
      { id: "scivedda-piccante", name: "Scivedda Piccante", desc: "Tonno, mango, cipolla rossa, carote, spicy mayo, cipolla croccante e lime. Piccante al punto giusto.", price: 12.50, allergens: ["pesce", "uova", "sesamo"], vegetarian: false, vegan: false, popular: true },
      { id: "scivedda-pollo", name: "Scivedda Teriyaki", desc: "Pollo teriyaki su riso integrale con avocado, mais, carote, salsa teriyaki e zenzero marinato.", price: 10.90, allergens: ["glutine", "soia", "sesamo"], vegetarian: false, vegan: false },
      { id: "scivedda-veggie", name: "Scivedda Veggie Power", desc: "100% vegetale: tofu marinato, quinoa, avocado, mango, cetriolo, pomodorini, ponzu e nori.", price: 10.50, allergens: ["soia", "sesamo"], vegetarian: true, vegan: true },
      { id: "scivedda-tropical", name: "Scivedda Tropicale", desc: "Gamberi, mango, ananas, cetriolo, ponzu, tobiko e lime. Un viaggio ai tropici.", price: 12.90, allergens: ["crostacei", "pesce"], vegetarian: false, vegan: false },
    ],
  },
  {
    id: "pistoccu",
    label: "Pistoccu",
    subtitle: "L'unico Pistoccu tradizionale, solo da Scivedda",
    emoji: "🫓",
    items: [
      { id: "pistoccu-lardo", name: "Pistoccu con Lardo e Miele", desc: "Pistoccu tradizionale dell'Ogliastra con lardo di colonnata, miele di corbezzolo e scaglie di pecorino stagionato. Dolce e salato in perfetto equilibrio.", price: 7.50, allergens: ["glutine", "latte"], vegetarian: false, vegan: false },
      { id: "pistoccu-ricotta", name: "Pistoccu con Ricotta e Pomodoro", desc: "Pistoccu con ricotta fresca di pecora, pomodorino arrosto, origano e olio extravergine del Sulcis.", price: 6.50, allergens: ["glutine", "latte"], vegetarian: true, vegan: false },
      { id: "pistoccu-tonno", name: "Pistoccu con Tonno e Olive", desc: "Pistoccu con tonno pinna gialla sott'olio, olive taggiasche, capperi e pomodorino. Semplice e perfetto.", price: 8.00, allergens: ["glutine", "pesce"], vegetarian: false, vegan: false },
    ],
  },
  {
    id: "culurgionis",
    label: "Culurgionis",
    subtitle: "Culurgionis arrosto, sempre e solo fatti a mano",
    emoji: "🥟",
    items: [
      { id: "culurgionis-classici", name: "Culurgionis Classici Arrosto", desc: "I culurgionis dell'Ogliastra, ripieni di patate, menta e pecorino, arrostiti in padella con burro e salvia. Fatti a mano ogni mattina.", price: 12.00, allergens: ["glutine", "latte", "uova"], vegetarian: true, vegan: false },
      { id: "culurgionis-cinghiale", name: "Culurgionis con Ragù di Cinghiale", desc: "Culurgionis fatti a mano, arrostiti, con ragù lento di cinghiale sardo, mirto e bacche di ginepro.", price: 14.00, allergens: ["glutine", "uova", "sedano", "solfiti"], vegetarian: false, vegan: false },
      { id: "culurgionis-bottarga", name: "Culurgionis con Bottarga", desc: "Culurgionis di patate e menta, arrostiti, con bottarga di muggine grattugiata, olio e limone. Il mare nel piatto.", price: 15.00, allergens: ["glutine", "uova", "pesce"], vegetarian: false, vegan: false },
    ],
  },
  {
    id: "dolcetti",
    label: "Dolcetti",
    subtitle: "I nostri dolcetti, la frutta e qualche fine pasto",
    emoji: "🍯",
    items: [
      { id: "seadas", name: "Seadas con Miele", desc: "La seada sarda fritta al momento, ripiena di formaggio fresco acidulo, con miele di corbezzolo amaro. Croccante fuori, morbida dentro.", price: 5.00, allergens: ["glutine", "latte", "uova"], vegetarian: true, vegan: false },
      { id: "formagelle", name: "Formagella con Miele", desc: "Formagella di pecora fresca con miele millefiori sardo e noci tostate.", price: 4.50, allergens: ["latte", "fruttaGuscio"], vegetarian: true, vegan: false },
      { id: "frutta", name: "Frutta di Stagione", desc: "Frutta fresca di stagione, selezionata ogni mattina. Pulita, tagliata e pronta.", price: 4.00, allergens: [], vegetarian: true, vegan: true },
      { id: "pistoccu-dolce", name: "Pistoccu Dolce", desc: "Pistoccu con crema di mandorle sarde, miele e scorza d'arancia. Un fine pasto leggero e profumato.", price: 4.50, allergens: ["glutine", "fruttaGuscio"], vegetarian: true, vegan: true },
    ],
  },
  {
    id: "panedda",
    label: "Panedda",
    subtitle: "Il Panino di Scivedda",
    emoji: "🥙",
    items: [
      { id: "panedda-salmone", name: "Panedda col Salmone", desc: "Pane sardo morbido tostato, salmone marinato, avocado schiacciato, cetriolo, cipolla rossa e salsa ponzu. Fresco e saporito.", price: 9.50, allergens: ["glutine", "pesce", "sesamo"], vegetarian: false, vegan: false, popular: true },
      { id: "panedda-porchetta", name: "Panedda con la Porchetta", desc: "Pane di semola tostato con porchetta sarda affettata al momento, rucola selvatica, pomodorino e maionese al limone.", price: 9.00, allergens: ["glutine", "uova", "senape"], vegetarian: false, vegan: false, popular: true },
      { id: "panedda-tonno", name: "Panedda col Tonno", desc: "Pane carasau morbidito, tonno pinna gialla, olive verdi, capperi di Pantelleria, pomodorino e origano selvatico.", price: 8.50, allergens: ["glutine", "pesce"], vegetarian: false, vegan: false },
      { id: "panedda-culurgionis", name: "Panedda con Culurgionis", desc: "Pane di semola aperto, culurgionis arrosto tagliati a metà, pecorino fondente, rucola e riduzione di mirto. Il nostro signature.", price: 11.00, allergens: ["glutine", "latte", "uova"], vegetarian: true, vegan: false },
      { id: "panedda-veggie", name: "Panedda Veggie", desc: "Pane di segale tostato, hummus di ceci sardi, verdure grigliate, avocado, spinacino e tahini al limone. 100% vegetale.", price: 8.00, allergens: ["glutine", "sesamo"], vegetarian: true, vegan: true },
    ],
  },
  {
    id: "dabare",
    label: "Da Bere",
    subtitle: "Il Bar, di Scivedda",
    emoji: "🍷",
    items: [
      { id: "mirto", name: "Mirto Rosso", desc: "Liquore tradizionale sardo di mirto, servito ghiacciato. Il modo migliore per chiudere il pasto.", price: 4.00, allergens: ["solfiti"], vegetarian: true, vegan: true },
      { id: "vernaccia", name: "Vernaccia di Oristano", desc: "Il vino bianco sardo per eccellenza, secco e ambrato. Ottimo come aperitivo o con il pesce.", price: 5.00, allergens: ["solfiti"], vegetarian: true, vegan: true },
      { id: "cannonau", name: "Cannonau di Sardegna", desc: "Rosso robusto e caldo, ricco di polifenoli. Il vino della longevità sarda.", price: 5.00, allergens: ["solfiti"], vegetarian: true, vegan: true },
      { id: "acqua", name: "Acqua Naturale / Frizzante", desc: "Acqua in bottiglia da 50cl.", price: 2.00, allergens: [], vegetarian: true, vegan: true },
      { id: "te-freddo", name: "Tè Freddo Artigianale", desc: "Tè freddo fatto in casa, al limone o alla pesca. Senza zuccheri aggiunti.", price: 3.00, allergens: [], vegetarian: true, vegan: true },
      { id: "caffe", name: "Caffè", desc: "Espresso, macchiato o americano. Miscela sarda tostata artigianalmente.", price: 1.50, allergens: [], vegetarian: true, vegan: true },
    ],
  },
];

const SIZE_OPTIONS = [
  { id: "small",   label: "Small",   price: 10.90, bowlW: 72 },
  { id: "regular", label: "Regular", price: 11.90, bowlW: 96 },
  { id: "xl",      label: "XL",      price: 15.90, bowlW: 124 },
];

const MAX_BASI = 2;
const MAX_PROTEINE = 3;
const MAX_VERDURE = 4;
const MAX_CROCCANTI = 3;
const MAX_SALSE = 2;

// ── Bowl Visual Component ───────────────────────────────────────────────
const BowlVisual = ({ selected, animatingItem }) => {
  const allItems = [];
  Object.entries(selected).forEach(([cat, val]) => {
    if (!val) return;
    if (Array.isArray(val)) {
      val.forEach(id => {
        const item = MENU_CATEGORIES[cat]?.items.find(i => i.id === id);
        if (item) allItems.push({ ...item, category: cat });
      });
    } else {
      const item = MENU_CATEGORIES[cat]?.items.find(i => i.id === val);
      if (item) allItems.push({ ...item, category: cat });
    }
  });

  // Position items in the bowl
  const positionedItems = allItems.map((item, i) => {
    const total = allItems.length;
    const angle = (i / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
    const radiusX = 28 + (i % 2) * 8;
    const radiusY = 16 + (i % 2) * 5;
    const cx = 50 + Math.cos(angle) * radiusX;
    const cy = 48 + Math.sin(angle) * radiusY;
    return { ...item, cx, cy, delay: i * 0.08 };
  });

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 320, margin: "0 auto" }}>
      <svg viewBox="0 0 100 80" style={{ width: "100%", filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.15))" }}>
        {/* Bowl shadow */}
        <ellipse cx="50" cy="72" rx="40" ry="5" fill="rgba(0,0,0,0.08)" />
        {/* Bowl body */}
        <path
          d="M10,35 Q10,68 50,70 Q90,68 90,35 Z"
          fill="url(#bowlGradient)"
          stroke="#d4a373"
          strokeWidth="0.8"
        />
        {/* Bowl rim */}
        <ellipse cx="50" cy="35" rx="42" ry="14" fill="url(#rimGradient)" stroke="#d4a373" strokeWidth="0.6" />
        {/* Inner bowl */}
        <ellipse cx="50" cy="36" rx="38" ry="11.5" fill="url(#innerGradient)" />

        {/* Ingredients */}
        {positionedItems.map((item, i) => (
          <g key={item.id + i} style={{
            animation: animatingItem === item.id ? "dropIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
          }}>
            <text
              x={item.cx}
              y={item.cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={item.category === "basi" ? "9" : item.category === "proteine" ? "10" : "7.5"}
              style={{
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))",
                opacity: 1,
              }}
            >
              {item.icon}
            </text>
          </g>
        ))}

        <defs>
          <linearGradient id="bowlGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8d5b7" />
            <stop offset="100%" stopColor="#c9a96e" />
          </linearGradient>
          <linearGradient id="rimGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5e6d3" />
            <stop offset="100%" stopColor="#e8d5b7" />
          </linearGradient>
          <radialGradient id="innerGradient">
            <stop offset="0%" stopColor="#faf6f0" />
            <stop offset="100%" stopColor="#f0e6d8" />
          </radialGradient>
        </defs>
      </svg>

      {allItems.length === 0 && (
        <div style={{
          position: "absolute", top: "38%", left: "50%", transform: "translate(-50%, -50%)",
          textAlign: "center", pointerEvents: "none",
        }}>
          <div style={{ fontSize: 11, color: "#b8a080", fontWeight: 500 }}>Scegli gli ingredienti</div>
        </div>
      )}

      <style>{`
        @keyframes dropIn {
          0% { transform: translateY(-15px) scale(1.5); opacity: 0; }
          60% { transform: translateY(2px) scale(0.9); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const IngredientCard = React.memo(function IngredientCard({ item, sel, isDouble, catColor, theme, onSelect, onDoubleSelect }) {
  return (
    <button
      onClick={(e) => { if (e.detail >= 2) return; onSelect(); }}
      onDoubleClick={onDoubleSelect}
      style={{
        background: "#faf7f2",
        border: isDouble ? `2px solid #e53e3e` : sel ? `2.5px solid ${theme.accent}` : `1.5px solid ${theme.border}`,
        borderRadius: 16, padding: 0, cursor: "pointer",
        display: "flex", flexDirection: "column",
        transition: "all 0.2s", transform: sel ? "scale(1.04)" : "scale(1)",
        boxShadow: isDouble ? `0 2px 8px rgba(229,62,62,0.2)` : sel ? `0 4px 16px rgba(212,118,60,0.25)` : `0 1px 4px rgba(0,0,0,0.07)`,
        overflow: "hidden", position: "relative", userSelect: "none",
      }}>
      {isDouble && (
        <div style={{ position: "absolute", top: 6, left: 6, width: 18, height: 18, borderRadius: "50%", background: "#e53e3e", color: "#fff", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, zIndex: 2 }}>2</div>
      )}
      {sel && (
        <div style={{ position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: "50%", background: isDouble ? "#e53e3e" : theme.accent, color: "#fff", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, zIndex: 2 }}>✓</div>
      )}
      {item.cardImage ? (
        <img src={item.cardImage} alt={item.name} style={{ width: "100%", height: 62, objectFit: "cover", objectPosition: "center", display: "block" }} />
      ) : (
        <div style={{ width: "100%", height: 62, background: catColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 32 }}>{item.icon}</span>
        </div>
      )}
      <div style={{ height: 62, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderTop: `1px solid ${theme.border}`, padding: "0 6px", width: "100%" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: theme.text, textAlign: "center", lineHeight: 1.2 }}>{item.name}</div>
        <div style={{ fontSize: 9, color: theme.textSoft, marginTop: 1 }}>{item.cal} cal</div>
        {item.extra && (
          <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: theme.accent, borderRadius: 4, padding: "1px 5px", marginTop: 2 }}>+€{item.extra}</span>
        )}
      </div>
    </button>
  );
});

// ── Main App ────────────────────────────────────────────────────────────
export default function BowlOrderApp() {
  const [, startTransition] = useTransition();
  const [view, setView] = useState("menu"); // menu | build | cart | summary | confirm
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState({ size: null, basi: [], proteine: [], verdure: [], croccanti: [], salse: [], special: [] });
  const [portions, setPortions] = useState({});
  const [activeCategory, setActiveCategory] = useState("size");
  const [animatingItem, setAnimatingItem] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [diningOption, setDiningOption] = useState(null); // "qui" | "via"
  const [pendingOrderCode, setPendingOrderCode] = useState(null);
  const [orderSent, setOrderSent] = useState(false);
  const [showCartBounce, setShowCartBounce] = useState(false);
  const [warnedStep, setWarnedStep] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [photoModal, setPhotoModal] = useState(null);

  // ── Admin state ──────────────────────────────────────────────────────
  const [adminSession, setAdminSession] = useState(null);
  const [adminView, setAdminView] = useState(false);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const logoTapCount = useRef(0);
  const logoTapTimer = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setAdminSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setAdminSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const fetchOrders = async () => {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase.from("orders").select("*, order_items(*)").gte("created_at", cutoff).order("created_at", { ascending: false }).limit(200);
    if (data) setAdminOrders(data);
  };

  const generateOrderCode = async () => {
    const { data, error } = await supabase.rpc("get_next_order_number");
    if (error || !data) return String(Date.now()).slice(-3);
    return data;
  };

  useEffect(() => {
    if (!adminSession || !adminView) return;
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    const channel = supabase.channel("orders-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => fetchOrders())
      .subscribe();
    return () => { clearInterval(interval); supabase.removeChannel(channel); };
  }, [adminSession, adminView]);

  const handleLogoTap = () => {
    logoTapCount.current += 1;
    clearTimeout(logoTapTimer.current);
    logoTapTimer.current = setTimeout(() => { logoTapCount.current = 0; }, 1500);
    if (logoTapCount.current >= 5) { logoTapCount.current = 0; setAdminView(true); }
  };

  const adminLogin = async () => {
    setAdminLoading(true); setAdminLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPassword });
    if (error) setAdminLoginError("Email o password errati");
    setAdminLoading(false);
  };

  const adminLogout = async () => {
    await supabase.auth.signOut();
    setAdminView(false);
    setAdminOrders([]);
  };

  const updateOrderStatus = async (orderId, status) => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    setAdminOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const confirmWhatsapp = async (orderId) => {
    const orderCode = await generateOrderCode();
    await supabase.from("orders").update({ whatsapp_confirmed: true, order_code: orderCode }).eq("id", orderId);
    setAdminOrders(prev => prev.map(o => o.id === orderId ? { ...o, whatsapp_confirmed: true, order_code: orderCode } : o));
  };

  const resolveIngredients = (details) => {
    if (!details) return [];
    const size = SIZE_OPTIONS.find(s => s.id === details.size)?.label;
    const lines = [];
    if (size) lines.push(`Taglia: ${size}`);
    [
      { key: "basi", label: "Base", src: MENU_CATEGORIES.basi.items },
      { key: "proteine", label: "Proteine", src: MENU_CATEGORIES.proteine.items },
      { key: "verdure", label: "Verdure", src: MENU_CATEGORIES.verdure.items },
      { key: "croccanti", label: "Croccanti", src: MENU_CATEGORIES.croccanti.items },
      { key: "salse", label: "Salse", src: MENU_CATEGORIES.salse.items },
      { key: "special", label: "Special", src: MENU_CATEGORIES.special.items },
    ].forEach(({ key, label, src }) => {
      const ids = details[key] || [];
      if (!ids.length) return;
      lines.push(`${label}: ${ids.map(id => src.find(i => i.id === id)?.name ?? id).join(", ")}`);
    });
    return lines;
  };

  const printOrder = (order) => {
    supabase.from("orders").update({ print_requested_at: new Date().toISOString() }).eq("id", order.id).then();

    const time = new Date(order.created_at).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    const code = order.order_code || "—";
    const note = order.customer_note ? `<div class="note">NOTA: ${order.customer_note}</div>` : "";

    // Espandi ogni item per qty — ogni bowl = ticket separato
    const bowls = [];
    (order.order_items || []).forEach(item => {
      for (let i = 0; i < (item.qty || 1); i++) bowls.push(item);
    });
    const total = bowls.length;

    const tickets = bowls.map((item, idx) => {
      const ingr = item.item_type === "custom" && item.details
        ? resolveIngredients(item.details).map(l => `<div class="ing-line">${l}</div>`).join("")
        : "";
      return `
        <div class="ticket">
          <div class="code">${code}</div>
          <div class="bowl-num">Bowl ${idx + 1} di ${total}</div>
          <div class="divider">- - - - - - - - - - - - -</div>
          <div class="cname">${order.customer_name || "Cliente"}</div>
          <div class="time-lbl">${time}</div>
          <div class="divider">- - - - - - - - - - - - -</div>
          <div class="iname">${item.item_name}</div>
          ${ingr}
          ${note}
        </div>`;
    }).join('<div class="pb"></div>');

    const win = window.open("", "_blank", "width=420,height=700");
    win.document.write(`<html><head><title>Ordine ${code}</title><style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: monospace; }
      .ticket { padding: 24px 20px; width: 100%; }
      .code { font-size: 52px; font-weight: 900; text-align: center; letter-spacing: 3px; margin-bottom: 2px; }
      .bowl-num { font-size: 15px; text-align: center; color: #555; margin-bottom: 14px; }
      .divider { text-align: center; color: #aaa; font-size: 12px; margin: 8px 0; }
      .cname { font-size: 22px; font-weight: 700; margin-bottom: 2px; }
      .time-lbl { font-size: 12px; color: #666; margin-bottom: 10px; }
      .iname { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
      .ing-line { font-size: 14px; line-height: 1.9; }
      .note { margin-top: 10px; font-size: 13px; font-weight: 700; border-top: 1px dashed #000; padding-top: 8px; }
      .pb { page-break-after: always; }
      @media print { button { display: none; } .pb { page-break-after: always; } }
    </style></head><body>
      ${tickets}
      <div style="padding:20px"><button onclick="window.print()" style="width:100%;padding:14px;font-size:16px;cursor:pointer;font-family:monospace;font-weight:700">Stampa tutti i ticket (${total})</button></div>
    </body></html>`);
    win.document.close();
    win.focus();
  };

  const toggleSection = (id) => setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  const getPortion = (category, itemId) => portions[`${category}_${itemId}`] || 1;
  const togglePortion = (category, itemId) => {
    const key = `${category}_${itemId}`;
    setPortions(prev => ({ ...prev, [key]: prev[key] === 2 ? 1 : 2 }));
  };

  const catOrder = ["size", "basi", "proteine", "verdure", "croccanti", "salse", "special"];

  const selectIngredient = (category, itemId) => {
    setAnimatingItem(itemId);
    setTimeout(() => setAnimatingItem(null), 500);

    startTransition(() => setSelected(prev => {
      const next = { ...prev };
      const MAX = { basi: MAX_BASI, proteine: MAX_PROTEINE, verdure: MAX_VERDURE, croccanti: MAX_CROCCANTI, salse: MAX_SALSE };
      const max = MAX[category] ?? Infinity;
      if (next[category].includes(itemId)) {
        next[category] = next[category].filter(x => x !== itemId);
      } else if (next[category].length < max) {
        next[category] = [...next[category], itemId];
      }
      return next;
    }));
  };

  const isSelected = (category, itemId) => {
    return Array.isArray(selected[category])
      ? selected[category].includes(itemId)
      : selected[category] === itemId;
  };

  const customBowlValid = selected.size && selected.basi.length > 0;
  const proteinItemExtra = selected.proteine.reduce((sum, id) => sum + (MENU_CATEGORIES.proteine.items.find(i => i.id === id)?.extra ?? 0) * getPortion("proteine", id), 0);
  const proteinCountExtra = Math.max(0, selected.proteine.length - 1) * 3;
  const verdureItemExtra = selected.verdure.reduce((sum, id) => sum + (MENU_CATEGORIES.verdure.items.find(i => i.id === id)?.extra ?? 0) * getPortion("verdure", id), 0);
  const croccantItemExtra = selected.croccanti.reduce((sum, id) => sum + (MENU_CATEGORIES.croccanti.items.find(i => i.id === id)?.extra ?? 0) * getPortion("croccanti", id), 0);
  const salseItemExtra = selected.salse.reduce((sum, id) => sum + (MENU_CATEGORIES.salse.items.find(i => i.id === id)?.extra ?? 0) * getPortion("salse", id), 0);
  const specialItemExtra = selected.special.reduce((sum, id) => sum + 1 * getPortion("special", id), 0);
  const customPrice = (SIZE_OPTIONS.find(s => s.id === selected.size)?.price ?? 11.90) + proteinItemExtra + proteinCountExtra + verdureItemExtra + croccantItemExtra + salseItemExtra + specialItemExtra;

  const addCustomToCart = () => {
    if (!customBowlValid) return;
    const bowlItems = { ...selected };
    const desc = [
      ...selected.basi.map(b => MENU_CATEGORIES.basi.items.find(i => i.id === b)?.name),
      ...selected.proteine.map(p => MENU_CATEGORIES.proteine.items.find(i => i.id === p)?.name),
      ...selected.verdure.map(v => MENU_CATEGORIES.verdure.items.find(i => i.id === v)?.name),
      ...selected.croccanti.map(c => MENU_CATEGORIES.croccanti.items.find(i => i.id === c)?.name),
      ...selected.salse.map(s => MENU_CATEGORIES.salse.items.find(i => i.id === s)?.name),
      ...selected.special.map(s => MENU_CATEGORIES.special.items.find(i => i.id === s)?.name),
    ].filter(Boolean).join(", ");

    const bowlPortions = {};
    ["proteine", "verdure", "croccanti", "salse", "special"].forEach(cat => {
      selected[cat].forEach(id => {
        const key = `${cat}_${id}`;
        if (portions[key]) bowlPortions[key] = portions[key];
      });
    });

    const sizeLabel = SIZE_OPTIONS.find(s => s.id === selected.size)?.label ?? "";
    setCart(prev => [...prev, {
      id: Date.now(),
      type: "custom",
      name: `Scivedda Custom ${sizeLabel}`,
      desc,
      items: bowlItems,
      portions: bowlPortions,
      price: customPrice,
      qty: 1,
    }]);
    setSelected({ size: null, basi: [], proteine: [], verdure: [], croccanti: [], salse: [], special: [] });
    setPortions(prev => { const next = { ...prev }; Object.keys(bowlPortions).forEach(k => delete next[k]); return next; });
    setActiveCategory("size");
    generateOrderCode().then(code => setPendingOrderCode(code));
    setView("summary");
  };

  const addMenuItemToCart = (item) => {
    if (!item.price) return; // skip items without price (e.g. piatto del giorno)
    setCart(prev => {
      const existing = prev.find(c => c.menuItemId === item.id);
      if (existing) {
        return prev.map(c => c.menuItemId === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, {
        id: Date.now(),
        menuItemId: item.id,
        type: "menu",
        name: item.name,
        desc: item.desc,
        price: item.price,
        qty: 1,
      }];
    });
    setShowCartBounce(true);
    setTimeout(() => setShowCartBounce(false), 600);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id));
  const updateQty = (id, delta) => {
    setCart(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newQty = c.qty + delta;
      return newQty > 0 ? { ...c, qty: newQty } : c;
    }).filter(c => c.qty > 0));
  };

  const totalPrice = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const totalItems = cart.reduce((s, c) => s + c.qty, 0);

  const buildOrderText = (orderCode = null) => {
    const catLabels = {
      basi: "Base",
      proteine: "Proteine",
      verdure: "Verdure",
      croccanti: "Croccanti",
      salse: "Salsa",
      special: "Special",
    };

    let text = `*Ecco il mio ordine!*\n`;
    if (orderCode) text += `n. ${orderCode}\n`;
    if (customerName) text += `*${customerName}*\n`;
    if (diningOption === "qui") text += `Mangio qui\n`;
    if (diningOption === "via") text += `Porto via\n`;
    text += `\n`;

    cart.forEach((item, idx) => {
      text += `*Quantità: n.${item.qty}*\n`;

      if (item.type === "menu") {
        text += `${item.name} (da menù)\n`;
      } else {
        text += `${item.name}\n`;
        const its = item.items;
        Object.entries(catLabels).forEach(([cat, label]) => {
          const val = its[cat];
          if (!val || (Array.isArray(val) && val.length === 0)) return;
          const names = Array.isArray(val)
            ? val.map(id => {
                const name = MENU_CATEGORIES[cat].items.find(i => i.id === id)?.name?.toUpperCase();
                const p = item.portions?.[`${cat}_${id}`] || 1;
                return p === 2 ? `${name} x2` : name;
              }).filter(Boolean).join(" - ")
            : MENU_CATEGORIES[cat].items.find(i => i.id === val)?.name?.toUpperCase();
          if (names) text += `${label}: ${names}\n`;
        });
      }

      if (idx < cart.length - 1) text += `\n`;
    });

    text += `\n*Totale: EUR ${totalPrice.toFixed(2)}*`;
    if (customerNote) text += `\nNote: ${customerNote}`;
    return text;
  };

  const WA_BUSINESS_NUMBER = "393475157410";

  const sendOrder = async () => {
    // Usa il codice già pronto (generato all'ingresso nel riepilogo)
    const orderCode = pendingOrderCode || String(Date.now()).slice(-3);
    const text = buildOrderText(orderCode);
    const waUrl = `https://wa.me/${WA_BUSINESS_NUMBER}?text=${encodeURIComponent(text)}`;
    // WhatsApp apre PRIMA di qualsiasi await — il browser non lo blocca
    window.open(waUrl, "_blank");
    setOrderSent(true);

    // Salva su Supabase in background
    try {
      const orderId = crypto.randomUUID();
      const finalCode = pendingOrderCode || await generateOrderCode();
      const { error: orderError } = await supabase.from("orders").insert({
        id: orderId,
        customer_name: customerName || null,
        customer_note: customerNote || null,
        total: totalPrice,
        status: "nuovo",
        order_code: finalCode,
      });
      if (orderError) { console.error("ORDER INSERT ERROR:", orderError); return; }

      const items = cart.map(item => ({
        order_id: orderId,
        item_name: item.name,
        item_type: item.type,
        price: item.price,
        qty: item.qty,
        details: item.type === "custom" ? item.items : null,
      }));
      const { error: itemsError } = await supabase.from("order_items").insert(items);
      if (itemsError) console.error("ITEMS INSERT ERROR:", itemsError);
    } catch (e) {
      console.error("Supabase exception:", e);
    }
  };

  const resetOrder = () => {
    setCart([]);
    setSelected({ size: null, basi: [], proteine: [], verdure: [], croccanti: [], salse: [], special: [] });
    setPortions({});
    setView("menu");
    setOrderSent(false);
    setCustomerName("");
    setCustomerNote("");
  };

  // ── Styles ──────────────────────────────────────────────────────────────
  const theme = {
    bg: "#faf7f2",
    card: "#ffffff",
    text: "#2d2418",
    textSoft: "#8c7b6b",
    accent: "#d4763c",
    accentLight: "#fef0e7",
    green: "#5a8f5c",
    greenLight: "#e8f5e9",
    border: "#ebe4da",
    warm: "#f5ede3",
  };

  // ── Render: Menu ──────────────────────────────────────────────────────
  const renderMenu = () => (
    <div style={{ paddingBottom: cart.length > 0 ? 100 : 32 }}>
      {/* Hero */}
      <div style={{
        textAlign: "center",
        padding: "32px 20px 20px",
        background: `linear-gradient(180deg, ${theme.warm} 0%, ${theme.bg} 100%)`,
      }}>
        <div style={{ fontSize: 48, marginBottom: 8, cursor: "default", userSelect: "none" }} onClick={handleLogoTap}>🥣</div>
        <h1 style={{
          fontFamily: "'Jaapokki', sans-serif",
          fontSize: 30, color: theme.text,
          margin: 0, letterSpacing: 1,
        }}>
          Scivedda
        </h1>
        <p style={{ color: theme.textSoft, fontSize: 13, margin: "6px 0 0", lineHeight: 1.5 }}>
          Scegli dal menù oppure crea la tua scivedda
        </p>
      </div>

      {/* CTA — Crea la tua Scivedda (nel flusso, non fixed) */}
      <div style={{ padding: "0 16px 16px" }}>
        <button
          onClick={() => { setView("build"); setActiveCategory("size"); }}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          style={{
            width: "100%", padding: "18px 20px",
            background: `linear-gradient(135deg, ${theme.green}, #3d7a40)`,
            border: "none", borderRadius: 18,
            color: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            boxShadow: "0 6px 24px rgba(90,143,92,0.35)",
            fontFamily: "'Jaapokki', sans-serif",
            transition: "transform 0.15s",
          }}
        >
          <span style={{ fontSize: 24 }}>🎨</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 17, letterSpacing: 1, textTransform: "uppercase" }}>Crea la tua Scivedda</div>
            <div style={{ fontSize: 11, opacity: 0.85, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
              Scegli ogni ingrediente — da €10.90
            </div>
          </div>
          <span style={{ fontSize: 22, marginLeft: "auto" }}>→</span>
        </button>
      </div>

      {/* Accordion Sections */}
      <div style={{ padding: "0 16px 0" }}>
        {MENU_SECTIONS.map((section, si) => {
          const isOpen = !!openSections[section.id];
          return (
            <div key={section.id} style={{
              marginBottom: 8,
              borderRadius: 16,
              border: `1px solid ${theme.border}`,
              background: theme.card,
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              animation: `fadeSlideUp 0.3s ease both`,
              animationDelay: `${si * 0.05}s`,
            }}>
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                style={{
                  width: "100%", padding: "16px",
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 12,
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 26 }}>{section.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Jaapokki', sans-serif",
                    fontSize: 17, color: theme.text, letterSpacing: 1, textTransform: "uppercase",
                  }}>{section.label}</div>
                  <div style={{ fontSize: 11, color: theme.textSoft, marginTop: 2 }}>
                    {section.subtitle}
                  </div>
                </div>
                <span style={{
                  fontSize: 18, color: theme.textSoft,
                  transition: "transform 0.25s",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  display: "inline-block",
                }}>›</span>
              </button>

              {/* Section Items — Carousel */}
              {isOpen && (
                <div style={{ borderTop: `1px solid ${theme.border}`, paddingBottom: 4 }}>
                  <div style={{
                    display: "flex", gap: 10,
                    overflowX: "auto", padding: "14px 16px",
                    scrollbarWidth: "none", msOverflowStyle: "none",
                  }}>
                    {section.items.map(item => (
                      <div key={item.id} style={{
                        minWidth: 140, maxWidth: 140,
                        borderRadius: 14,
                        border: `1px solid ${theme.border}`,
                        background: theme.card,
                        overflow: "hidden",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                        cursor: "pointer",
                        flexShrink: 0,
                      }} onClick={() => setPhotoModal({ ...item, sectionEmoji: section.emoji })}>
                        {/* Image area */}
                        <div style={{
                          height: 120,
                          background: item.image
                            ? `url(${item.image}) center/cover no-repeat`
                            : `linear-gradient(135deg, ${theme.warm}, ${theme.accentLight})`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          position: "relative",
                        }}>
                          {!item.image && (
                            <span style={{ fontSize: 44, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>
                              {section.emoji}
                            </span>
                          )}
                          {/* Badges overlay */}
                          <div style={{ position: "absolute", top: 6, left: 6, display: "flex", gap: 3 }}>
                            {item.popular && (
                              <span style={{ background: "#e65100", color: "#fff", fontSize: 7, fontWeight: 700, padding: "2px 5px", borderRadius: 4, textTransform: "uppercase" }}>⭐</span>
                            )}
                            {item.vegan && (
                              <span style={{ background: "#2e7d32", color: "#fff", fontSize: 7, fontWeight: 700, padding: "2px 5px", borderRadius: 4 }}>VG</span>
                            )}
                            {!item.vegan && item.vegetarian && (
                              <span style={{ background: "#558b2f", color: "#fff", fontSize: 7, fontWeight: 700, padding: "2px 5px", borderRadius: 4 }}>V</span>
                            )}
                          </div>
                        </div>
                        {/* Info */}
                        <div style={{ padding: "10px 10px 10px" }}>
                          <div style={{
                            fontFamily: "'Jaapokki', sans-serif",
                            fontSize: 12, color: theme.text, lineHeight: 1.35,
                            marginBottom: 8, letterSpacing: 0.2,
                            display: "-webkit-box", WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical", overflow: "hidden",
                          }}>{item.name}</div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: theme.accent }}>
                              {item.price ? `€${item.price.toFixed(2)}` : "—"}
                            </span>
                            {item.price && (
                              <button onClick={e => { e.stopPropagation(); addMenuItemToCart(item); }} style={{
                                background: theme.accent, border: "none", borderRadius: 8,
                                color: "#fff", fontSize: 16, width: 30, height: 30,
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: "0 2px 6px rgba(212,118,60,0.3)",
                              }}
                                onMouseDown={e => { e.stopPropagation(); e.currentTarget.style.transform = "scale(0.88)"; }}
                                onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                              >+</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );

  // ── Render: Build ─────────────────────────────────────────────────────
  const renderBuild = () => {
    const isSize = activeCategory === "size";
    const cat = isSize ? null : MENU_CATEGORIES[activeCategory];
    const catIdx = catOrder.indexOf(activeCategory);
    const isMulti = activeCategory !== "size";
    const limit = activeCategory === "basi" ? MAX_BASI : activeCategory === "proteine" ? MAX_PROTEINE : activeCategory === "verdure" ? MAX_VERDURE : activeCategory === "croccanti" ? MAX_CROCCANTI : activeCategory === "salse" ? MAX_SALSE : Infinity;
    const currentCount = isMulti ? selected[activeCategory].length : 0;

    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100svh" }}>
        {/* Header */}
        <div style={{
          padding: "16px",
          display: "flex", alignItems: "center", gap: 12,
          background: theme.warm,
          borderBottom: `1px solid ${theme.border}`,
        }}>
          <button onClick={() => setView("menu")} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 22, color: theme.text, padding: 4,
          }}>←</button>
          <div>
            <div style={{
              fontFamily: "'Jaapokki', sans-serif",
              fontSize: 18, fontWeight: 700, color: theme.text, textTransform: "uppercase", letterSpacing: 1,
            }}>Crea la tua Scivedda</div>
            <div style={{ fontSize: 12, color: theme.textSoft }}>
              {selected.size ? `€${customPrice.toFixed(2)}` : "Small · Regular · XL"}
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 5,
          padding: "10px 16px 6px",
          background: theme.bg,
        }}>
          {catOrder.map((c) => {
            const hasSelection = c === "size"
              ? !!selected.size
              : Array.isArray(selected[c])
              ? selected[c].length > 0
              : !!selected[c];
            return (
              <button key={c} onClick={() => setActiveCategory(c)} style={{
                width: activeCategory === c ? 20 : 8,
                height: 8, borderRadius: 4,
                background: activeCategory === c ? theme.accent : hasSelection ? theme.green : theme.border,
                border: "none", cursor: "pointer",
                padding: 0,
                transition: "all 0.25s",
                flexShrink: 0,
              }} />
            );
          })}
        </div>

        {/* Bowl Visual — compact strip */}
        <div style={{ background: theme.bg, display: "flex", justifyContent: "center", paddingTop: 2 }}>
          <div style={{ width: 100, pointerEvents: "none" }}>
            <BowlVisual selected={selected} animatingItem={animatingItem} />
          </div>
        </div>

        {/* Selector panel */}
        <div style={{
          flex: 1, background: theme.card,
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          border: `1px solid ${theme.border}`, borderBottom: "none",
          padding: "16px 16px 86px",
          marginTop: 4, boxShadow: "0 -4px 20px rgba(0,0,0,0.05)",
          overflowY: "auto",
        }}>

          {/* ── SIZE STEP ── */}
          {isSize && (
            <>
              {/* Nome cliente */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 6 }}>
                  Il tuo nome
                </div>
                <input
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Scrivi il tuo nome..."
                  autoComplete="given-name"
                  style={{
                    width: "100%", padding: "13px 14px",
                    borderRadius: 12, fontSize: 15, fontFamily: "inherit",
                    border: customerName.trim() ? `2px solid ${theme.accent}` : `2px solid #ef4444`,
                    background: customerName.trim() ? theme.bg : "#fff5f5",
                    color: theme.text, outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ fontSize: 11, color: customerName.trim() ? theme.textSoft : "#ef4444", marginTop: 4, fontWeight: customerName.trim() ? 400 : 600 }}>
                  {customerName.trim() ? "Apparirà nell'ordine in cucina" : "Il nome è obbligatorio"}
                </div>
              </div>

              <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 4 }}>
                Scegli la dimensione
              </div>
              <div style={{ fontSize: 11, color: theme.textSoft, marginBottom: 18 }}>
                {selected.size ? "✓ Selezionata" : "Seleziona 1"}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {SIZE_OPTIONS.map(sz => {
                  const sel = selected.size === sz.id;
                  return (
                    <button key={sz.id}
                      onClick={() => setSelected(prev => ({ ...prev, size: sz.id }))}
                      style={{
                        flex: 1, padding: "16px 6px 14px",
                        background: sel ? theme.accentLight : theme.bg,
                        border: sel ? `2px solid ${theme.accent}` : `1.5px solid ${theme.border}`,
                        borderRadius: 16, cursor: "pointer",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        transition: "all 0.2s",
                        transform: sel ? "scale(1.04)" : "scale(1)",
                        boxShadow: sel ? "0 4px 14px rgba(212,118,60,0.15)" : "none",
                        position: "relative",
                      }}>
                      {sel && (
                        <div style={{
                          position: "absolute", top: 6, right: 6,
                          width: 16, height: 16, borderRadius: "50%",
                          background: theme.accent, color: "#fff",
                          fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700,
                        }}>✓</div>
                      )}
                      {/* Bowl SVG scalata */}
                      <svg viewBox="0 0 100 80" style={{ width: sz.bowlW, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}>
                        <ellipse cx="50" cy="72" rx="40" ry="5" fill="rgba(0,0,0,0.06)" />
                        <path d="M10,35 Q10,68 50,70 Q90,68 90,35 Z" fill="url(#bG)" stroke="#d4a373" strokeWidth="0.8" />
                        <ellipse cx="50" cy="35" rx="42" ry="14" fill="url(#rG)" stroke="#d4a373" strokeWidth="0.6" />
                        <ellipse cx="50" cy="36" rx="38" ry="11.5" fill="url(#iG)" />
                        <defs>
                          <linearGradient id="bG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e8d5b7" /><stop offset="100%" stopColor="#c9a96e" /></linearGradient>
                          <linearGradient id="rG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f5e6d3" /><stop offset="100%" stopColor="#e8d5b7" /></linearGradient>
                          <radialGradient id="iG"><stop offset="0%" stopColor="#faf6f0" /><stop offset="100%" stopColor="#f0e6d8" /></radialGradient>
                        </defs>
                      </svg>
                      <div style={{
                        fontFamily: "'Jaapokki', sans-serif",
                        fontSize: 13, color: theme.text, letterSpacing: 1, textTransform: "uppercase",
                      }}>{sz.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: theme.accent }}>
                        €{sz.price.toFixed(2)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── INGREDIENT STEPS ── */}
          {!isSize && (
            <>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>
                  {cat.emoji} Scegli {cat.label.toLowerCase()}
                </div>
                <div style={{ fontSize: 11, color: theme.textSoft, marginTop: 2 }}>
                  {activeCategory === "proteine"
                    ? `Seleziona fino a ${limit} — proteine extra +€3 cad. (${currentCount}/${limit})`
                    : activeCategory === "verdure"
                    ? `Seleziona fino a ${limit} — alcune con sovrapprezzzo (${currentCount}/${limit})`
                    : activeCategory === "croccanti"
                    ? `Seleziona fino a ${limit} — alcuni con sovrapprezzzo (${currentCount}/${limit})`
                    : activeCategory === "salse"
                    ? `Scegli fino a 2 salse (${currentCount}/${limit})`
                    : activeCategory === "special"
                    ? `Ogni special aggiunge +€1 al totale (${currentCount} selezionati)`
                    : isMulti
                    ? `Seleziona fino a ${limit} (${currentCount}/${limit})`
                    : "Seleziona 1"
                  }
                </div>
              </div>
              {activeCategory !== "basi" && (
                <div style={{ fontSize: 10, color: theme.textSoft, marginBottom: 10, opacity: 0.7 }}>
                  Doppio tap su un ingrediente per indicare la doppia porzione
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
                {cat.items.map(item => {
                  const sel = isSelected(activeCategory, item.id);
                  const portion = activeCategory !== "basi" ? getPortion(activeCategory, item.id) : 1;
                  const isDouble = sel && portion === 2;
                  return (
                    <IngredientCard
                      key={item.id}
                      item={item}
                      sel={sel}
                      isDouble={isDouble}
                      catColor={cat.color}
                      theme={theme}
                      onSelect={() => {
                        if (sel && activeCategory !== "basi") {
                          setPortions(prev => { const n = { ...prev }; delete n[`${activeCategory}_${item.id}`]; return n; });
                        }
                        selectIngredient(activeCategory, item.id);
                      }}
                      onDoubleSelect={() => {
                        if (!sel) selectIngredient(activeCategory, item.id);
                        if (activeCategory !== "basi") togglePortion(activeCategory, item.id);
                      }}
                    />
                  );
                })}
              </div>
            </>
          )}

        </div>

        {/* Fixed bottom bar: price + navigation always visible */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 1024,
          background: "#fff",
          borderTop: `1px solid ${theme.border}`,
          padding: "10px 14px 22px",
          display: "flex", alignItems: "center", gap: 8,
          zIndex: 90,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
        }}>
          {/* Price chip */}
          <div style={{
            background: theme.warm, borderRadius: 10,
            padding: "6px 10px", flexShrink: 0,
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <span style={{ fontSize: 9, color: theme.textSoft, textTransform: "uppercase", letterSpacing: 0.5 }}>Totale</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: theme.accent, fontFamily: "'Jaapokki', sans-serif" }}>
              €{customPrice.toFixed(2)}
            </span>
          </div>

          {/* Back button */}
          {catIdx > 0 && (
            <button onClick={() => setActiveCategory(catOrder[catIdx - 1])} style={{
              flexShrink: 0, padding: "11px 14px",
              background: theme.bg, border: `1px solid ${theme.border}`,
              borderRadius: 12, cursor: "pointer", fontSize: 12, fontWeight: 600,
              color: theme.textSoft, fontFamily: "inherit",
            }}>
              ←
            </button>
          )}

          {/* Forward / Add to cart */}
          {catIdx < catOrder.length - 1 ? (
            <>
              {(() => {
                // Calcola blocco e messaggio per ogni step
                const hardBlock =
                  (catIdx === 0 && (!customerName.trim() || !selected.size)) ||
                  (catIdx === 1 && selected.basi.length === 0);
                const softWarn =
                  (catIdx === 2 && selected.proteine.length === 0) ||
                  (catIdx === 3 && selected.verdure.length < 4);

                let msg = null;
                if (catIdx === 0 && !customerName.trim()) msg = "Inserisci il tuo nome per andare avanti!";
                else if (catIdx === 0 && !selected.size) msg = "Scegli la dimensione per andare avanti!";
                else if (catIdx === 1 && selected.basi.length === 0) msg = "Seleziona almeno una base per andare avanti!";
                else if (catIdx === 2 && selected.proteine.length === 0 && warnedStep === catIdx) msg = "Non hai scelto nessuna proteina! Se vuoi comunque andare avanti clicca nuovamente.";
                else if (catIdx === 3 && selected.verdure.length < 4 && warnedStep === catIdx) msg = "Non hai scelto le 4 verdure! Se è la tua scelta clicca nuovamente per andare avanti!";

                const handleClick = () => {
                  if (hardBlock) return;
                  if (softWarn && warnedStep !== catIdx) { setWarnedStep(catIdx); return; }
                  setWarnedStep(null);
                  setActiveCategory(catOrder[catIdx + 1]);
                };

                return (
                  <>
                    {msg && (
                      <div style={{ position: "absolute", bottom: "100%", left: 14, right: 14, marginBottom: 8, textAlign: "center", fontSize: 13, fontWeight: 700, color: hardBlock ? "#ef4444" : "#e57c3c", background: "#fff", borderRadius: 8, padding: "6px 10px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                        {msg}
                      </div>
                    )}
                    <button onClick={handleClick} style={{
                      flex: 1, padding: "13px",
                      background: hardBlock ? "#ccc" : theme.accent,
                      border: "none", borderRadius: 12,
                      cursor: hardBlock ? "not-allowed" : "pointer",
                      fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "inherit",
                      boxShadow: hardBlock ? "none" : "0 2px 10px rgba(212,118,60,0.3)",
                      transition: "background 0.2s",
                    }}>
                      {catIdx === 0 ? "Base →" : `${MENU_CATEGORIES[catOrder[catIdx + 1]].label} →`}
                    </button>
                  </>
                );
              })()}
            </>
          ) : (
            <button onClick={addCustomToCart} disabled={!customBowlValid} style={{
              flex: 1, padding: "13px",
              background: customBowlValid ? theme.green : "#ccc",
              border: "none", borderRadius: 12,
              cursor: customBowlValid ? "pointer" : "not-allowed",
              fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "inherit",
              boxShadow: customBowlValid ? "0 2px 10px rgba(90,143,92,0.3)" : "none",
              letterSpacing: 0.5, textTransform: "uppercase",
            }}>
              Invia ordine →
            </button>
          )}
        </div>
      </div>
    );
  };

  // ── Render: Cart ──────────────────────────────────────────────────────
  const renderCart = () => (
    <div style={{ minHeight: "100vh", background: theme.bg }}>
      <div style={{
        padding: "16px",
        display: "flex", alignItems: "center", gap: 12,
        background: theme.warm,
        borderBottom: `1px solid ${theme.border}`,
      }}>
        <button onClick={() => setView("menu")} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 22, color: theme.text, padding: 4,
        }}>←</button>
        <div style={{
          fontFamily: "'Jaapokki', sans-serif",
          fontSize: 18, fontWeight: 700, color: theme.text,
        }}>Il tuo ordine</div>
        <span style={{
          marginLeft: "auto",
          background: theme.accent, color: "#fff",
          fontSize: 12, fontWeight: 700,
          padding: "3px 10px", borderRadius: 12,
        }}>{totalItems}</span>
      </div>

      <div style={{ padding: 16 }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: theme.textSoft }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🥣</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>Il tuo ordine è vuoto</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Aggiungi una scivedda per iniziare</div>
            <button onClick={() => setView("menu")} style={{
              marginTop: 20, padding: "12px 28px",
              background: theme.accent, border: "none", borderRadius: 12,
              color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>Vai al menu</button>
          </div>
        ) : (
          <>
            {cart.map(item => (
              <div key={item.id} style={{
                background: theme.card, borderRadius: 14,
                border: `1px solid ${theme.border}`,
                padding: 16, marginBottom: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>
                      {item.type === "custom" ? "🎨 " : "⭐ "}{item.name}
                    </div>
                    <div style={{
                      fontSize: 12, color: theme.textSoft, marginTop: 4, lineHeight: 1.4,
                      maxWidth: 250,
                    }}>{item.desc}</div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 18, color: "#ccc", padding: 0,
                  }}>×</button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: theme.bg, border: `1px solid ${theme.border}`,
                      cursor: "pointer", fontSize: 16, color: theme.text,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>−</button>
                    <span style={{
                      width: 40, textAlign: "center",
                      fontSize: 16, fontWeight: 700, color: theme.text,
                    }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: theme.accent, border: "none",
                      cursor: "pointer", fontSize: 16, color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>+</button>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: theme.accent }}>
                    €{(item.price * item.qty).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}

            {/* Customer info */}
            <div style={{
              background: theme.card, borderRadius: 14,
              border: `1px solid ${theme.border}`,
              padding: 16, marginBottom: 12,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 10 }}>
                📝 Dettagli ordine
              </div>
              <input
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Il tuo nome"
                style={{
                  width: "100%", padding: "10px 12px",
                  background: customerName.trim() ? theme.bg : "#fff5f5",
                  border: customerName.trim() ? `1px solid ${theme.border}` : `2px solid #ef4444`,
                  borderRadius: 10, fontSize: 14, color: theme.text,
                  fontFamily: "inherit", marginBottom: 8,
                  outline: "none", boxSizing: "border-box",
                }}
              />
              <textarea
                value={customerNote}
                onChange={e => setCustomerNote(e.target.value)}
                placeholder="Note (allergie, consegna, ecc.)"
                rows={2}
                style={{
                  width: "100%", padding: "10px 12px",
                  background: theme.bg, border: `1px solid ${theme.border}`,
                  borderRadius: 10, fontSize: 14, color: theme.text,
                  fontFamily: "inherit", resize: "none",
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>

            {/* Total & Proceed */}
            <div style={{
              background: theme.card, borderRadius: 14,
              border: `1px solid ${theme.border}`,
              padding: 16,
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 16,
              }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>Totale</span>
                <span style={{
                  fontSize: 24, fontWeight: 800, color: theme.accent,
                  fontFamily: "'Jaapokki', sans-serif",
                }}>€{totalPrice.toFixed(2)}</span>
              </div>
              <button onClick={() => { generateOrderCode().then(code => setPendingOrderCode(code)); setView("summary"); }} style={{
                width: "100%", padding: "16px",
                background: theme.accent,
                border: "none", borderRadius: 14,
                color: "#fff", fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: "0 4px 16px rgba(212,118,60,0.3)",
              }}>
                Vedi riepilogo →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ── Render: Summary ───────────────────────────────────────────────────
  const renderSummary = () => {
    const catLabels = {
      basi: "Base",
      proteine: "Proteine",
      verdure: "Verdure",
      croccanti: "Croccanti",
      salse: "Salsa",
      special: "Special",
    };

    return (
      <div style={{ minHeight: "100vh", background: theme.bg }}>
        {/* Header */}
        <div style={{
          padding: "16px",
          display: "flex", alignItems: "center", gap: 12,
          background: theme.warm,
          borderBottom: `1px solid ${theme.border}`,
        }}>
          <button onClick={() => setView("cart")} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 22, color: theme.text, padding: 4,
          }}>←</button>
          <div style={{
            fontFamily: "'Jaapokki', sans-serif",
            fontSize: 18, fontWeight: 700, color: theme.text,
          }}>Riepilogo ordine</div>
        </div>

        <div style={{ padding: 16 }}>
          {/* Preview messaggio WA */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: theme.textSoft, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Anteprima messaggio WhatsApp
            </div>
            <div style={{
              background: "#e9fbe5",
              borderRadius: "4px 16px 16px 16px",
              padding: "14px 16px",
              border: "1px solid #c5e8be",
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
              lineHeight: 1.6,
              color: "#111",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              {/* Render formattato visivamente */}
              {(() => {
                const lines = [];
                if (customerName) lines.push(<div key="nome"><b>👤 {customerName}</b></div>);
                lines.push(<div key="sep0" style={{ height: 6 }} />);

                cart.forEach((item, idx) => {
                  lines.push(
                    <div key={`qty-${idx}`}><b>Quantità: n.{item.qty}</b></div>
                  );
                  if (item.type === "menu") {
                    lines.push(<div key={`name-${idx}`}>{item.name} (da menù)</div>);
                  } else {
                    lines.push(<div key={`custom-${idx}`}>Bowl Custom</div>);
                    Object.entries(catLabels).forEach(([cat, label]) => {
                      const val = item.items[cat];
                      if (!val || (Array.isArray(val) && val.length === 0)) return;
                      const names = Array.isArray(val)
                        ? val.map(id => {
                            const name = MENU_CATEGORIES[cat].items.find(i => i.id === id)?.name?.toUpperCase();
                            const p = item.portions?.[`${cat}_${id}`] || 1;
                            return p === 2 ? `${name} x2` : name;
                          }).filter(Boolean).join(" - ")
                        : MENU_CATEGORIES[cat].items.find(i => i.id === val)?.name?.toUpperCase();
                      if (names) lines.push(<div key={`${idx}-${cat}`}>{label}: {names}</div>);
                    });
                  }
                  if (idx < cart.length - 1) lines.push(<div key={`sep-${idx}`} style={{ height: 8 }} />);
                });

                lines.push(<div key="sep-total" style={{ height: 8 }} />);
                lines.push(<div key="total"><b>💰 Totale: €{totalPrice.toFixed(2)}</b></div>);
                if (customerNote) lines.push(<div key="note">📝 Note: {customerNote}</div>);
                return lines;
              })()}
            </div>
          </div>

          {/* Nome nel riepilogo */}
          <div style={{
            background: theme.card, borderRadius: 14,
            border: customerName.trim() ? `1px solid ${theme.border}` : `2px solid #ef4444`,
            padding: 16, marginBottom: 12,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: customerName.trim() ? theme.text : "#ef4444", marginBottom: 8 }}>
              {customerName.trim() ? "Il tuo nome" : "Il tuo nome è obbligatorio"}
            </div>
            <input
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Scrivi il tuo nome..."
              autoComplete="given-name"
              style={{
                width: "100%", padding: "11px 13px",
                background: customerName.trim() ? theme.bg : "#fff5f5",
                border: customerName.trim() ? `1px solid ${theme.border}` : `2px solid #ef4444`,
                borderRadius: 10, fontSize: 14, color: theme.text,
                fontFamily: "inherit", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {/* Totale */}
          <div style={{
            background: theme.card, borderRadius: 14,
            border: `1px solid ${theme.border}`,
            padding: "14px 16px", marginBottom: 12,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>Totale ordine</span>
            <span style={{
              fontSize: 24, fontWeight: 800, color: theme.accent,
              fontFamily: "'Jaapokki', sans-serif",
            }}>€{totalPrice.toFixed(2)}</span>
          </div>

          {/* Mangia qui / Porta via */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.textSoft, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Come preferisci?
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {[{ id: "qui", label: "Mangi qui?", icon: "🍽" }, { id: "via", label: "Porti via", icon: "🥡" }].map(opt => (
                <button key={opt.id} onClick={() => setDiningOption(diningOption === opt.id ? null : opt.id)} style={{
                  flex: 1, padding: "14px 8px",
                  background: diningOption === opt.id ? theme.accent : theme.card,
                  border: diningOption === opt.id ? `2px solid ${theme.accent}` : `1.5px solid ${theme.border}`,
                  borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  transition: "all 0.2s",
                }}>
                  <span style={{ fontSize: 28 }}>{opt.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: diningOption === opt.id ? "#fff" : theme.text }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Aggiungi un'altra scivedda */}
          <button onClick={() => { setView("build"); setActiveCategory("size"); }} style={{
            width: "100%", padding: "14px",
            background: theme.bg,
            border: `2px dashed ${theme.border}`,
            borderRadius: 14,
            color: theme.textSoft, fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 18 }}>🥣</span>
            + Aggiungi un'altra Scivedda
          </button>

          {/* Bottone invio WA */}
          {(!customerName.trim() || !diningOption) && (
            <div style={{ textAlign: "center", marginBottom: 10, fontSize: 13, fontWeight: 700, color: "#ef4444" }}>
              {!customerName.trim() ? "Inserisci il nome per inviare l'ordine!" : "Scegli se mangi qui o porti via!"}
            </div>
          )}
          <button onClick={sendOrder} disabled={!customerName.trim() || !diningOption} style={{
            width: "100%", padding: "17px",
            background: customerName.trim() && diningOption ? "linear-gradient(135deg, #25d366, #128c7e)" : "#ccc",
            border: "none", borderRadius: 14,
            color: "#fff", fontSize: 16, fontWeight: 700,
            cursor: customerName.trim() ? "pointer" : "not-allowed", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: customerName.trim() ? "0 4px 20px rgba(37,211,102,0.35)" : "none",
            transition: "background 0.2s, box-shadow 0.2s",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            Invia il tuo ordine su WhatsApp
          </button>

          <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: theme.textSoft }}>
            Si aprirà WhatsApp con il messaggio pronto da inviare
          </div>
        </div>
      </div>
    );
  };

  // ── Render: Admin Login ───────────────────────────────────────────────
  const renderAdminLogin = () => (
    <div style={{ minHeight: "100vh", background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
          <div style={{ fontFamily: "'Jaapokki', sans-serif", fontSize: 22, color: theme.text, letterSpacing: 1 }}>Admin Scivedda</div>
        </div>
        <div style={{ background: theme.card, borderRadius: 18, padding: 24, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <input value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="Email" type="email"
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, fontSize: 14, fontFamily: "inherit", marginBottom: 12, outline: "none", boxSizing: "border-box", background: theme.bg }} />
          <input value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Password" type="password"
            onKeyDown={e => e.key === "Enter" && adminLogin()}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, fontSize: 14, fontFamily: "inherit", marginBottom: 16, outline: "none", boxSizing: "border-box", background: theme.bg }} />
          {adminLoginError && <div style={{ color: "#e53e3e", fontSize: 13, marginBottom: 12 }}>{adminLoginError}</div>}
          <button onClick={adminLogin} disabled={adminLoading} style={{
            width: "100%", padding: "14px", background: theme.accent, border: "none", borderRadius: 12,
            color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>{adminLoading ? "..." : "Accedi"}</button>
          <button onClick={() => setAdminView(false)} style={{ width: "100%", padding: "10px", background: "none", border: "none", color: theme.textSoft, fontSize: 13, cursor: "pointer", marginTop: 8 }}>
            ← Torna al menù
          </button>
        </div>
      </div>
    </div>
  );

  // ── Render: Admin Dashboard ───────────────────────────────────────────
  const renderAdmin = () => {
    const today = new Date().toDateString();
    const todayOrders = adminOrders.filter(o => new Date(o.created_at).toDateString() === today);

    const statusColors = { nuovo: "#f59e0b", preparazione: "#3b82f6", pronto: "#10b981" };
    const statusLabels = { nuovo: "Nuovo", preparazione: "In prep.", pronto: "Pronto" };
    const isConfirmed = (order) => order.whatsapp_confirmed === true;

    return (
      <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
        {/* Header */}
        <div style={{ background: theme.text, color: "#fff", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Jaapokki', sans-serif", fontSize: 20, letterSpacing: 1 }}>Dashboard Scivedda</div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>Ordini in tempo reale</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={fetchOrders} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 16 }}>↻</button>
            <button onClick={adminLogout} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Esci</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: "16px 16px 0", display: "flex", gap: 12 }}>
          {/* Ordini da fare — grande */}
          <div style={{ flex: 2, background: "#fff", borderRadius: 14, padding: "16px 12px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderBottom: `3px solid ${theme.accent}` }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: theme.accent, fontFamily: "'Jaapokki', sans-serif", lineHeight: 1 }}>
              {todayOrders.filter(o => isConfirmed(o) && o.status !== "pronto").length}
            </div>
            <div style={{ fontSize: 12, color: theme.textSoft, marginTop: 6, fontWeight: 600 }}>Da fare oggi</div>
          </div>
          {/* Ordini oggi — piccolo */}
          <div style={{ flex: 1, background: "#fff", borderRadius: 14, padding: "16px 12px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: theme.text, fontFamily: "'Jaapokki', sans-serif", lineHeight: 1 }}>{todayOrders.length}</div>
            <div style={{ fontSize: 11, color: theme.textSoft, marginTop: 6 }}>Ordini oggi</div>
          </div>
        </div>

        {/* Orders list */}
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.textSoft, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Ordini recenti (48h)</div>
          {adminOrders.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: theme.textSoft }}>Nessun ordine ancora</div>
          )}
          {(() => {
            const todayStr = new Date().toDateString();
            let shownYesterdayLabel = false;
            return adminOrders.map(order => {
              const confirmed = isConfirmed(order);
              const orderDate = new Date(order.created_at);
              const isYesterday = orderDate.toDateString() !== todayStr;
              const showLabel = isYesterday && !shownYesterdayLabel;
              if (showLabel) shownYesterdayLabel = true;
              return (
                <React.Fragment key={order.id}>
                  {showLabel && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 10px" }}>
                      <div style={{ flex: 1, height: 1, background: "#cbd5e1" }} />
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Ordini di ieri</div>
                      <div style={{ flex: 1, height: 1, background: "#cbd5e1" }} />
                    </div>
                  )}
                  <div style={{
                    background: isYesterday ? "#f8f8f8" : confirmed ? "#f0fdf4" : "#fff",
                    borderRadius: 14, padding: 16, marginBottom: 10,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    borderLeft: `4px solid ${isYesterday ? "#cbd5e1" : confirmed ? "#22c55e" : (statusColors[order.status] || "#ccc")}`,
                    opacity: isYesterday ? 0.75 : 1,
                    transition: "background 0.3s, border-color 0.3s"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        {order.order_code && (
                          <div style={{ fontSize: 36, fontWeight: 900, color: isYesterday ? "#94a3b8" : theme.accent, letterSpacing: 2, lineHeight: 1, marginBottom: 6 }}>{order.order_code}</div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>{order.customer_name || "Cliente anonimo"}</div>
                          {confirmed && !isYesterday && <div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", background: "#dcfce7", borderRadius: 6, padding: "2px 6px" }}>WA CONFERMATO</div>}
                          {isYesterday && <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", background: "#e2e8f0", borderRadius: 6, padding: "2px 6px" }}>IERI</div>}
                        </div>
                        <div style={{ fontSize: 11, color: theme.textSoft, marginTop: 2 }}>
                          {orderDate.toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: isYesterday ? theme.textSoft : theme.accent }}>€{Number(order.total).toFixed(2)}</div>
                    </div>
                    {order.order_items?.map((item, i) => (
                      <div key={i} style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 12, color: theme.textSoft }}>
                          {item.qty}× <strong>{item.item_name}</strong> — €{Number(item.price).toFixed(2)}
                        </div>
                        {item.item_type === "custom" && item.details && resolveIngredients(item.details).map((line, j) => (
                          <div key={j} style={{ fontSize: 11, color: theme.textSoft, paddingLeft: 14, opacity: 0.8 }}>{line}</div>
                        ))}
                      </div>
                    ))}
                    {order.customer_note && (
                      <div style={{ marginTop: 8, fontSize: 12, color: "#7c3aed", background: "#f5f3ff", borderRadius: 6, padding: "4px 8px" }}>
                        Nota: {order.customer_note}
                      </div>
                    )}
                    {!confirmed && (
                      <button onClick={() => confirmWhatsapp(order.id)} style={{
                        width: "100%", marginTop: 10, padding: "9px 0", borderRadius: 8, border: "none",
                        cursor: "pointer", fontSize: 12, fontWeight: 700,
                        background: "#25d366", color: "#fff", letterSpacing: 0.5
                      }}>Conferma WhatsApp</button>
                    )}
                    {confirmed && (
                      <>
                        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                          {["nuovo", "preparazione", "pronto"].map(s => (
                            <button key={s} onClick={() => updateOrderStatus(order.id, s)} style={{
                              flex: 1, padding: "7px 4px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700,
                              background: order.status === s ? statusColors[s] : "#f1f5f9",
                              color: order.status === s ? "#fff" : theme.textSoft,
                            }}>{statusLabels[s]}</button>
                          ))}
                        </div>
                        <button onClick={() => printOrder(order)} style={{
                          width: "100%", marginTop: 8, padding: "13px 0", borderRadius: 10, border: "none",
                          cursor: "pointer", fontSize: 15, fontWeight: 700,
                          background: "#e2e8f0", color: "#475569",
                        }}>🖨 Stampa ordine</button>
                      </>
                    )}
                  </div>
                </React.Fragment>
              );
            });
          })()}
        </div>
      </div>
    );
  };

  // ── Render: Confirmation ──────────────────────────────────────────────
  const renderConfirm = () => (
    <div style={{
      minHeight: "100vh", background: theme.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div style={{ textAlign: "center", maxWidth: 340 }}>
        <div style={{
          fontSize: 64, marginBottom: 16,
          animation: "bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}>🎉</div>
        <h2 style={{
          fontFamily: "'Jaapokki', sans-serif",
          fontSize: 24, fontWeight: 800, color: theme.text, margin: "0 0 8px",
        }}>Ordine inviato!</h2>
        <p style={{ color: theme.textSoft, fontSize: 14, lineHeight: 1.5, margin: "0 0 24px" }}>
          Il tuo ordine è stato inviato su WhatsApp. Ti risponderemo con la conferma e i tempi di preparazione.
        </p>
        <button onClick={resetOrder} style={{
          padding: "14px 32px",
          background: theme.accent, border: "none", borderRadius: 12,
          color: "#fff", fontSize: 14, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit",
        }}>Nuovo ordine</button>
      </div>
    </div>
  );

  // ── Main Render ─────────────────────────────────────────────────────────
  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      background: theme.bg,
      color: theme.text,
      minHeight: "100vh",
      width: "100%",
      maxWidth: 1024,
      margin: "0 auto",
      position: "relative",
      overflowX: "hidden",
      boxShadow: "0 0 60px rgba(0,0,0,0.08)",
    }}>
      <link href="https://fonts.cdnfonts.com/css/jaapokki" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Photo Modal ───────────────────────────────────────────────── */}
      {photoModal && (
        <div
          onClick={() => setPhotoModal(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: theme.card, width: "100%", maxWidth: 1024,
              borderRadius: "24px 24px 0 0",
              maxHeight: "88vh", overflowY: "auto",
              animation: "slideUp 0.28s cubic-bezier(0.34,1.1,0.64,1)",
            }}
          >
            {/* Image */}
            <div style={{
              height: 220,
              background: photoModal.image
                ? `url(${photoModal.image}) top/cover no-repeat`
                : `linear-gradient(135deg, ${theme.warm}, ${theme.accentLight})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "24px 24px 0 0",
              position: "relative",
            }}>
              {!photoModal.image && (
                <span style={{ fontSize: 72 }}>{photoModal.sectionEmoji}</span>
              )}
              <button onClick={() => setPhotoModal(null)} style={{
                position: "absolute", top: 14, right: 14,
                background: "rgba(0,0,0,0.35)", border: "none",
                color: "#fff", borderRadius: "50%", width: 34, height: 34,
                fontSize: 18, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>×</button>
            </div>

            {/* Content */}
            <div style={{ padding: "20px 20px 32px" }}>
              {/* Name + badges */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                <h2 style={{
                  fontFamily: "'Jaapokki', sans-serif",
                  fontSize: 20, color: theme.text, margin: 0, letterSpacing: 0.5, lineHeight: 1.3,
                }}>{photoModal.name}</h2>
                <div style={{ display: "flex", gap: 4, flexShrink: 0, marginTop: 2 }}>
                  {photoModal.vegan && <span style={{ background: "#2e7d32", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 5 }}>VG</span>}
                  {!photoModal.vegan && photoModal.vegetarian && <span style={{ background: "#558b2f", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 5 }}>V</span>}
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: 14, color: theme.textSoft, lineHeight: 1.6, margin: "0 0 16px" }}>
                {photoModal.desc}
              </p>

              {/* Allergens */}
              {photoModal.allergens.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: theme.textSoft, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Allergeni</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {photoModal.allergens.map(a => (
                      <span key={a} style={{
                        background: theme.accentLight, color: theme.accent,
                        fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 600,
                      }}>{ALLERGEN_LABELS[a] || a}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Price + Add */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span style={{
                  fontFamily: "'Jaapokki', sans-serif",
                  fontSize: 26, color: theme.accent, letterSpacing: 0.5,
                }}>
                  {photoModal.price ? `€${photoModal.price.toFixed(2)}` : "Chiedi al banco"}
                </span>
                {photoModal.price && (
                  <button onClick={() => { addMenuItemToCart(photoModal); setPhotoModal(null); }} style={{
                    flex: 1, maxWidth: 180, padding: "14px",
                    background: theme.accent, border: "none", borderRadius: 14,
                    color: "#fff", fontSize: 15, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                    boxShadow: "0 4px 14px rgba(212,118,60,0.3)",
                  }}>
                    + Aggiungi
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {adminView ? (
        adminSession ? renderAdmin() : renderAdminLogin()
      ) : orderSent ? renderConfirm() : (
        <>
          {view === "menu" && renderMenu()}
          {view === "build" && renderBuild()}
          {view === "cart" && renderCart()}
          {view === "summary" && renderSummary()}

          {/* Floating cart button */}
          {view !== "cart" && view !== "build" && view !== "summary" && cart.length > 0 && (
            <div style={{
              position: "fixed",
              bottom: 20, left: "50%", transform: "translateX(-50%)",
              zIndex: 100,
              maxWidth: 440, width: "calc(100% - 32px)",
            }}>
              <button onClick={() => setView("cart")} style={{
                width: "100%",
                padding: "14px 20px",
                background: theme.accent,
                border: "none", borderRadius: 14,
                color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                boxShadow: "0 6px 24px rgba(212,118,60,0.4)",
                fontFamily: "inherit",
                animation: showCartBounce ? "cartBounce 0.5s ease" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    background: "rgba(255,255,255,0.25)",
                    padding: "2px 8px", borderRadius: 8,
                    fontSize: 13, fontWeight: 800,
                  }}>{totalItems}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Il tuo ordine</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 800 }}>€{totalPrice.toFixed(2)}</span>
              </button>
            </div>
          )}

          {/* Floating cart on build view */}
          {view === "build" && cart.length > 0 && (
            <button onClick={() => setView("cart")} style={{
              position: "fixed", bottom: 20, right: 20,
              width: 56, height: 56, borderRadius: "50%",
              background: theme.accent, border: "none",
              color: "#fff", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(212,118,60,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, zIndex: 100,
              animation: showCartBounce ? "cartBounce 0.5s ease" : "none",
            }}>
              📋
              <span style={{
                position: "absolute", top: -4, right: -4,
                width: 22, height: 22, borderRadius: "50%",
                background: "#e53e3e", color: "#fff",
                fontSize: 11, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{totalItems}</span>
            </button>
          )}
        </>
      )}

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cartBounce {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.05); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: #b8a080; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
