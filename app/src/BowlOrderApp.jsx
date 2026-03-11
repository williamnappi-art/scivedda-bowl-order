import { useState } from "react";

// ── Menu Data (in production, this comes from admin panel / API) ──────────
const MENU_CATEGORIES = {
  basi: {
    label: "Base",
    emoji: "🍚",
    color: "#f5e6d3",
    items: [
      { id: "riso", name: "Riso bianco", cal: 130, icon: "🍚" },
      { id: "riso-int", name: "Riso integrale", cal: 120, icon: "🍘" },
      { id: "quinoa", name: "Quinoa", cal: 110, icon: "🌾" },
      { id: "insalata", name: "Mix insalata", cal: 25, icon: "🥬" },
      { id: "noodles", name: "Noodles di riso", cal: 140, icon: "🍜" },
    ],
  },
  proteine: {
    label: "Proteina",
    emoji: "🐟",
    color: "#ffd6d6",
    items: [
      { id: "salmone", name: "Salmone", cal: 180, icon: "🍣" },
      { id: "tonno", name: "Tonno", cal: 160, icon: "🐟" },
      { id: "gamberi", name: "Gamberi", cal: 100, icon: "🦐" },
      { id: "pollo", name: "Pollo teriyaki", cal: 170, icon: "🍗" },
      { id: "tofu", name: "Tofu marinato", cal: 90, icon: "🧈" },
      { id: "edamame", name: "Edamame", cal: 120, icon: "🫛" },
    ],
  },
  verdure: {
    label: "Verdure & Frutta",
    emoji: "🥑",
    color: "#d4edda",
    items: [
      { id: "avocado", name: "Avocado", cal: 80, icon: "🥑" },
      { id: "mango", name: "Mango", cal: 60, icon: "🥭" },
      { id: "cetriolo", name: "Cetriolo", cal: 15, icon: "🥒" },
      { id: "carote", name: "Carote julienne", cal: 20, icon: "🥕" },
      { id: "pomodorini", name: "Pomodorini", cal: 18, icon: "🍅" },
      { id: "cipolla", name: "Cipolla rossa", cal: 10, icon: "🧅" },
      { id: "wakame", name: "Wakame", cal: 5, icon: "🌿" },
      { id: "mais", name: "Mais", cal: 35, icon: "🌽" },
      { id: "ananas", name: "Ananas", cal: 40, icon: "🍍" },
    ],
  },
  salse: {
    label: "Salsa",
    emoji: "🫗",
    color: "#fff3cd",
    items: [
      { id: "soia", name: "Salsa di soia", cal: 10, icon: "🫗" },
      { id: "teriyaki", name: "Teriyaki", cal: 25, icon: "🍯" },
      { id: "spicymayo", name: "Spicy mayo", cal: 45, icon: "🌶️" },
      { id: "ponzu", name: "Ponzu", cal: 10, icon: "🍋" },
      { id: "sesamo", name: "Salsa sesamo", cal: 35, icon: "🫘" },
    ],
  },
  topping: {
    label: "Topping",
    emoji: "✨",
    color: "#e8daef",
    items: [
      { id: "semi-sesamo", name: "Semi di sesamo", cal: 15, icon: "🫘" },
      { id: "cipolla-crisp", name: "Cipolla croccante", cal: 30, icon: "🧅" },
      { id: "nori", name: "Nori", cal: 5, icon: "🟢" },
      { id: "lime", name: "Lime", cal: 2, icon: "🍋‍🟩" },
      { id: "zenzero", name: "Zenzero marinato", cal: 5, icon: "🫚" },
      { id: "tobiko", name: "Tobiko", cal: 20, icon: "🔴" },
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
      { id: "brodu-berbeghe", name: "Brodu 'e Berbeghe", desc: "Il brodo di pecora della nonna, cotto lentamente con carote, sedano e cipolla. Servito con pane carasau tostato e un filo d'olio extravergine. Nutrimento puro, sapore di casa.", price: 8.50, allergens: ["glutine", "sedano"], vegetarian: false, vegan: false },
      { id: "brodu-puddha", name: "Brodu 'e Puddha", desc: "Brodo di gallina ruspante con verdure di stagione, zafferano di Sardegna e fregola piccola. Un classico della domenica sarda.", price: 7.50, allergens: ["glutine", "sedano"], vegetarian: false, vegan: false },
      { id: "fregola-arselle", name: "Fregola con le Arselle", desc: "Fregola sarda tostata con vongole veraci, pomodorino, aglio e prezzemolo. Il mare della Sardegna in un piatto.", price: 12.00, allergens: ["glutine", "molluschi", "sedano"], vegetarian: false, vegan: false },
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

const CUSTOM_SCIVEDDA_PRICE = 11.90;
const MAX_VERDURE = 4;
const MAX_TOPPING = 3;

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

// ── Main App ────────────────────────────────────────────────────────────
export default function BowlOrderApp() {
  const [view, setView] = useState("menu"); // menu | build | cart | summary | confirm
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState({ basi: null, proteine: null, verdure: [], salse: null, topping: [] });
  const [activeCategory, setActiveCategory] = useState("basi");
  const [animatingItem, setAnimatingItem] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [orderSent, setOrderSent] = useState(false);
  const [showCartBounce, setShowCartBounce] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const [photoModal, setPhotoModal] = useState(null); // item in focus

  const toggleSection = (id) => setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  const catOrder = ["basi", "proteine", "verdure", "salse", "topping"];

  const selectIngredient = (category, itemId) => {
    setAnimatingItem(itemId);
    setTimeout(() => setAnimatingItem(null), 500);

    setSelected(prev => {
      const next = { ...prev };
      if (category === "verdure") {
        if (next.verdure.includes(itemId)) {
          next.verdure = next.verdure.filter(v => v !== itemId);
        } else if (next.verdure.length < MAX_VERDURE) {
          next.verdure = [...next.verdure, itemId];
        }
      } else if (category === "topping") {
        if (next.topping.includes(itemId)) {
          next.topping = next.topping.filter(t => t !== itemId);
        } else if (next.topping.length < MAX_TOPPING) {
          next.topping = [...next.topping, itemId];
        }
      } else {
        next[category] = next[category] === itemId ? null : itemId;
      }
      return next;
    });
  };

  const isSelected = (category, itemId) => {
    if (category === "verdure" || category === "topping") {
      return selected[category].includes(itemId);
    }
    return selected[category] === itemId;
  };

  const customBowlValid = selected.basi && selected.proteine && selected.verdure.length > 0;

  const addCustomToCart = () => {
    if (!customBowlValid) return;
    const bowlItems = { ...selected };
    const desc = [
      MENU_CATEGORIES.basi.items.find(i => i.id === selected.basi)?.name,
      MENU_CATEGORIES.proteine.items.find(i => i.id === selected.proteine)?.name,
      ...selected.verdure.map(v => MENU_CATEGORIES.verdure.items.find(i => i.id === v)?.name),
      selected.salse ? MENU_CATEGORIES.salse.items.find(i => i.id === selected.salse)?.name : null,
      ...selected.topping.map(t => MENU_CATEGORIES.topping.items.find(i => i.id === t)?.name),
    ].filter(Boolean).join(", ");

    setCart(prev => [...prev, {
      id: Date.now(),
      type: "custom",
      name: "Scivedda Custom",
      desc,
      items: bowlItems,
      price: CUSTOM_SCIVEDDA_PRICE,
      qty: 1,
    }]);
    setSelected({ basi: null, proteine: null, verdure: [], salse: null, topping: [] });
    setActiveCategory("basi");
    setShowCartBounce(true);
    setTimeout(() => setShowCartBounce(false), 600);
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

  const buildOrderText = () => {
    const catLabels = {
      basi: "Base",
      proteine: "Proteine",
      verdure: "Verdure",
      salse: "Salse",
      topping: "Croccanti",
    };

    let text = `🥣 *Ordine Scivedda*\n`;
    if (customerName) text += `👤 *${customerName}*\n`;
    text += `\n`;

    cart.forEach((item, idx) => {
      text += `*Quantità: n.${item.qty}*\n`;

      if (item.type === "menu") {
        text += `${item.name} (da menù)\n`;
      } else {
        text += `Scivedda Custom\n`;
        const its = item.items;
        Object.entries(catLabels).forEach(([cat, label]) => {
          const val = its[cat];
          if (!val || (Array.isArray(val) && val.length === 0)) return;
          const names = Array.isArray(val)
            ? val.map(id => MENU_CATEGORIES[cat].items.find(i => i.id === id)?.name?.toUpperCase()).filter(Boolean).join(" - ")
            : MENU_CATEGORIES[cat].items.find(i => i.id === val)?.name?.toUpperCase();
          if (names) text += `${label}: ${names}\n`;
        });
      }

      if (idx < cart.length - 1) text += `\n`;
    });

    text += `\n💰 *Totale: €${totalPrice.toFixed(2)}*`;
    if (customerNote) text += `\n📝 Note: ${customerNote}`;
    return text;
  };

  const WA_BUSINESS_NUMBER = "393475157410";

  const sendOrder = () => {
    const text = buildOrderText();
    const waUrl = WA_BUSINESS_NUMBER
      ? `https://wa.me/${WA_BUSINESS_NUMBER}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
    setOrderSent(true);
  };

  const resetOrder = () => {
    setCart([]);
    setSelected({ basi: null, proteine: null, verdure: [], salse: null, topping: [] });
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
    <div style={{ paddingBottom: 100 }}>
      {/* Hero */}
      <div style={{
        textAlign: "center",
        padding: "32px 20px 24px",
        background: `linear-gradient(180deg, ${theme.warm} 0%, ${theme.bg} 100%)`,
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🥣</div>
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

      {/* Accordion Sections */}
      <div style={{ padding: "8px 16px 0" }}>
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
                    fontSize: 17, color: theme.text, letterSpacing: 0.5,
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

      {/* Sticky CTA — Crea la tua Scivedda */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480,
        padding: "12px 16px 20px",
        background: `linear-gradient(180deg, transparent 0%, ${theme.bg} 30%)`,
        zIndex: 90,
      }}>
        <button onClick={() => { setView("build"); setActiveCategory("basi"); }} style={{
          width: "100%", padding: "16px 20px",
          background: `linear-gradient(135deg, ${theme.green}, #3d7a40)`,
          border: "none", borderRadius: 16,
          color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          boxShadow: "0 4px 20px rgba(90,143,92,0.35)",
          fontFamily: "'Jaapokki', sans-serif",
          transition: "transform 0.15s",
        }}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <span style={{ fontSize: 22 }}>🎨</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 16, letterSpacing: 0.5 }}>Crea la tua Scivedda</div>
            <div style={{ fontSize: 11, opacity: 0.85, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
              Scegli ogni ingrediente — €{CUSTOM_SCIVEDDA_PRICE.toFixed(2)}
            </div>
          </div>
          <span style={{ fontSize: 20, marginLeft: "auto" }}>→</span>
        </button>
      </div>
    </div>
  );

  // ── Render: Build ─────────────────────────────────────────────────────
  const renderBuild = () => {
    const cat = MENU_CATEGORIES[activeCategory];
    const catIdx = catOrder.indexOf(activeCategory);
    const isMulti = activeCategory === "verdure" || activeCategory === "topping";
    const limit = activeCategory === "verdure" ? MAX_VERDURE : activeCategory === "topping" ? MAX_TOPPING : 1;
    const currentCount = isMulti ? selected[activeCategory].length : (selected[activeCategory] ? 1 : 0);

    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
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
              fontSize: 18, fontWeight: 700, color: theme.text,
            }}>Crea la tua Scivedda</div>
            <div style={{ fontSize: 12, color: theme.textSoft }}>€{CUSTOM_SCIVEDDA_PRICE.toFixed(2)}</div>
          </div>
        </div>

        {/* Progress dots */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 6,
          padding: "14px 16px 8px",
          background: theme.bg,
        }}>
          {catOrder.map((c) => {
            const hasSelection = c === "verdure" || c === "topping"
              ? selected[c].length > 0
              : !!selected[c];
            return (
              <button key={c} onClick={() => setActiveCategory(c)} style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "5px 10px", borderRadius: 20,
                background: activeCategory === c ? theme.accent : hasSelection ? theme.greenLight : "rgba(0,0,0,0.04)",
                border: "none", cursor: "pointer",
                color: activeCategory === c ? "#fff" : hasSelection ? theme.green : theme.textSoft,
                fontSize: 11, fontWeight: 600,
                transition: "all 0.2s",
              }}>
                <span style={{ fontSize: 13 }}>{MENU_CATEGORIES[c].emoji}</span>
                {MENU_CATEGORIES[c].label}
                {hasSelection && activeCategory !== c && (
                  <span style={{ fontSize: 10 }}>✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bowl Visual */}
        <div style={{ padding: "8px 16px 0", background: theme.bg }}>
          <BowlVisual selected={selected} animatingItem={animatingItem} />
        </div>

        {/* Ingredient selector */}
        <div style={{
          flex: 1,
          background: theme.card,
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          border: `1px solid ${theme.border}`,
          borderBottom: "none",
          padding: "20px 16px",
          marginTop: 8,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.05)",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 14,
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>
                {cat.emoji} Scegli {cat.label.toLowerCase()}
              </div>
              <div style={{ fontSize: 11, color: theme.textSoft, marginTop: 2 }}>
                {isMulti
                  ? `Seleziona fino a ${limit} (${currentCount}/${limit})`
                  : selected[activeCategory] ? "✓ Selezionato" : "Seleziona 1"
                }
              </div>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: 10,
          }}>
            {cat.items.map(item => {
              const sel = isSelected(activeCategory, item.id);
              return (
                <button key={item.id} onClick={() => selectIngredient(activeCategory, item.id)} style={{
                  background: sel
                    ? `linear-gradient(135deg, ${theme.accentLight}, #fff)`
                    : theme.bg,
                  border: sel
                    ? `2px solid ${theme.accent}`
                    : `1.5px solid ${theme.border}`,
                  borderRadius: 14,
                  padding: "14px 8px 10px",
                  cursor: "pointer",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 4,
                  transition: "all 0.2s",
                  transform: sel ? "scale(1.03)" : "scale(1)",
                  boxShadow: sel ? "0 3px 12px rgba(212,118,60,0.15)" : "none",
                  position: "relative",
                }}>
                  {sel && (
                    <div style={{
                      position: "absolute", top: 4, right: 4,
                      width: 16, height: 16, borderRadius: "50%",
                      background: theme.accent,
                      color: "#fff", fontSize: 10,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700,
                    }}>✓</div>
                  )}
                  <span style={{ fontSize: 28 }}>{item.icon}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: theme.text,
                    textAlign: "center", lineHeight: 1.2,
                  }}>{item.name}</span>
                  <span style={{ fontSize: 9, color: theme.textSoft }}>{item.cal} cal</span>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div style={{
            display: "flex", gap: 10, marginTop: 20,
            paddingTop: 16,
            borderTop: `1px solid ${theme.border}`,
          }}>
            {catIdx > 0 && (
              <button onClick={() => setActiveCategory(catOrder[catIdx - 1])} style={{
                flex: 1, padding: "13px",
                background: theme.bg, border: `1px solid ${theme.border}`,
                borderRadius: 12, cursor: "pointer",
                fontSize: 13, fontWeight: 600, color: theme.textSoft,
                fontFamily: "inherit",
              }}>
                ← {MENU_CATEGORIES[catOrder[catIdx - 1]].label}
              </button>
            )}
            {catIdx < catOrder.length - 1 ? (
              <button onClick={() => setActiveCategory(catOrder[catIdx + 1])} style={{
                flex: 2, padding: "13px",
                background: theme.accent,
                border: "none", borderRadius: 12,
                cursor: "pointer",
                fontSize: 13, fontWeight: 700, color: "#fff",
                fontFamily: "inherit",
                boxShadow: "0 2px 8px rgba(212,118,60,0.25)",
              }}>
                {MENU_CATEGORIES[catOrder[catIdx + 1]].label} →
              </button>
            ) : (
              <button onClick={addCustomToCart} disabled={!customBowlValid} style={{
                flex: 2, padding: "13px",
                background: customBowlValid ? theme.green : "#ccc",
                border: "none", borderRadius: 12,
                cursor: customBowlValid ? "pointer" : "not-allowed",
                fontSize: 13, fontWeight: 700, color: "#fff",
                fontFamily: "inherit",
                boxShadow: customBowlValid ? "0 2px 8px rgba(90,143,92,0.3)" : "none",
              }}>
                🛒 Aggiungi al carrello
              </button>
            )}
          </div>
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
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>Il carrello è vuoto</div>
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
                  background: theme.bg, border: `1px solid ${theme.border}`,
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
              <button onClick={() => setView("summary")} style={{
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
      salse: "Salse",
      topping: "Croccanti",
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
                  if (item.type === "preset") {
                    lines.push(<div key={`name-${idx}`}>{item.name} (da menù)</div>);
                  } else {
                    lines.push(<div key={`custom-${idx}`}>Bowl Custom</div>);
                    Object.entries(catLabels).forEach(([cat, label]) => {
                      const val = item.items[cat];
                      if (!val || (Array.isArray(val) && val.length === 0)) return;
                      const names = Array.isArray(val)
                        ? val.map(id => MENU_CATEGORIES[cat].items.find(i => i.id === id)?.name?.toUpperCase()).filter(Boolean).join(" - ")
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

          {/* Bottone invio WA */}
          <button onClick={sendOrder} style={{
            width: "100%", padding: "17px",
            background: "linear-gradient(135deg, #25d366, #128c7e)",
            border: "none", borderRadius: 14,
            color: "#fff", fontSize: 16, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: "0 4px 20px rgba(37,211,102,0.35)",
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
      maxWidth: 480,
      margin: "0 auto",
      position: "relative",
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
              background: theme.card, width: "100%", maxWidth: 480,
              borderRadius: "24px 24px 0 0",
              maxHeight: "88vh", overflowY: "auto",
              animation: "slideUp 0.28s cubic-bezier(0.34,1.1,0.64,1)",
            }}
          >
            {/* Image */}
            <div style={{
              height: 220,
              background: photoModal.image
                ? `url(${photoModal.image}) center/cover no-repeat`
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

      {orderSent ? renderConfirm() : (
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
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Vedi carrello</span>
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
              🛒
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
