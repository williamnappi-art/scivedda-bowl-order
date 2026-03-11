import { useState, useRef, useEffect, useMemo } from "react";

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

const PRESET_BOWLS = [
  {
    id: "salmon-classic",
    name: "Salmon Classic",
    desc: "Il grande classico: salmone fresco su riso bianco con avocado e wakame",
    price: 11.90,
    image: "🍣",
    items: { basi: "riso", proteine: "salmone", verdure: ["avocado", "cetriolo", "wakame"], salse: "soia", topping: ["semi-sesamo", "nori"] },
    popular: true,
  },
  {
    id: "tuna-spicy",
    name: "Tuna Spicy",
    desc: "Tonno piccante con mango dolce e cipolla croccante",
    price: 12.50,
    image: "🐟",
    items: { basi: "riso", proteine: "tonno", verdure: ["mango", "cipolla", "carote"], salse: "spicymayo", topping: ["cipolla-crisp", "lime"] },
    popular: true,
  },
  {
    id: "chicken-teri",
    name: "Chicken Teriyaki",
    desc: "Pollo teriyaki su riso integrale con avocado e mais",
    price: 10.90,
    image: "🍗",
    items: { basi: "riso-int", proteine: "pollo", verdure: ["avocado", "mais", "carote"], salse: "teriyaki", topping: ["semi-sesamo", "zenzero"] },
  },
  {
    id: "veggie-power",
    name: "Veggie Power",
    desc: "100% vegetale: tofu marinato, quinoa e tanta freschezza",
    price: 10.50,
    image: "🥑",
    items: { basi: "quinoa", proteine: "tofu", verdure: ["avocado", "mango", "cetriolo", "pomodorini"], salse: "ponzu", topping: ["semi-sesamo", "nori"] },
  },
  {
    id: "tropical-shrimp",
    name: "Tropical Shrimp",
    desc: "Gamberi con mango, ananas e ponzu per un viaggio ai tropici",
    price: 12.90,
    image: "🦐",
    items: { basi: "riso", proteine: "gamberi", verdure: ["mango", "ananas", "cetriolo"], salse: "ponzu", topping: ["tobiko", "lime"] },
  },
];

const CUSTOM_BOWL_PRICE = 11.90;
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
  const [view, setView] = useState("menu"); // menu | build | cart | confirm
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState({ basi: null, proteine: null, verdure: [], salse: null, topping: [] });
  const [activeCategory, setActiveCategory] = useState("basi");
  const [animatingItem, setAnimatingItem] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [orderSent, setOrderSent] = useState(false);
  const [showCartBounce, setShowCartBounce] = useState(false);

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
      name: "Custom Bowl",
      desc,
      items: bowlItems,
      price: CUSTOM_BOWL_PRICE,
      qty: 1,
    }]);
    setSelected({ basi: null, proteine: null, verdure: [], salse: null, topping: [] });
    setActiveCategory("basi");
    setShowCartBounce(true);
    setTimeout(() => setShowCartBounce(false), 600);
  };

  const addPresetToCart = (preset) => {
    setCart(prev => {
      const existing = prev.find(c => c.presetId === preset.id);
      if (existing) {
        return prev.map(c => c.presetId === preset.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, {
        id: Date.now(),
        presetId: preset.id,
        type: "preset",
        name: preset.name,
        desc: preset.desc,
        price: preset.price,
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
    let text = `🥣 *Nuovo ordine*\n`;
    if (customerName) text += `👤 ${customerName}\n`;
    text += `\n`;
    cart.forEach(item => {
      text += `${item.qty > 1 ? item.qty + "× " : ""}*${item.name}*\n`;
      text += `  ${item.desc}\n\n`;
    });
    text += `💰 *Totale: €${totalPrice.toFixed(2)}*\n`;
    if (customerNote) text += `\n📝 Note: ${customerNote}`;
    return text;
  };

  const sendOrder = () => {
    const text = buildOrderText();
    // In production: this would send to the shop's WhatsApp number
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
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
    <div>
      {/* Hero */}
      <div style={{
        textAlign: "center",
        padding: "32px 20px 24px",
        background: `linear-gradient(180deg, ${theme.warm} 0%, ${theme.bg} 100%)`,
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🥣</div>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 28, fontWeight: 800, color: theme.text,
          margin: 0, letterSpacing: -0.5,
        }}>
          Componi la tua Bowl
        </h1>
        <p style={{ color: theme.textSoft, fontSize: 14, margin: "8px 0 0", lineHeight: 1.5 }}>
          Scegli dal menu oppure crea la tua combinazione
        </p>
      </div>

      {/* Preset Bowls */}
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          marginBottom: 16, paddingTop: 8,
        }}>
          <span style={{ fontSize: 18 }}>⭐</span>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 18, fontWeight: 700, color: theme.text, margin: 0,
          }}>Le nostre Bowl</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {PRESET_BOWLS.map((bowl, i) => (
            <div key={bowl.id}
              style={{
                background: theme.card,
                borderRadius: 16,
                border: `1px solid ${theme.border}`,
                padding: 16,
                display: "flex", alignItems: "center", gap: 14,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                animation: `fadeSlideUp 0.4s ease both`,
                animationDelay: `${i * 0.06}s`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {bowl.popular && (
                <div style={{
                  position: "absolute", top: 8, right: 8,
                  background: "#fff3e0", color: "#e65100",
                  fontSize: 9, fontWeight: 700, padding: "2px 7px",
                  borderRadius: 6, textTransform: "uppercase", letterSpacing: 0.5,
                }}>Popular</div>
              )}
              <div style={{
                width: 60, height: 60, borderRadius: 14,
                background: theme.warm,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, flexShrink: 0,
              }}>{bowl.image}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 16, fontWeight: 700, color: theme.text,
                }}>{bowl.name}</div>
                <div style={{
                  fontSize: 12, color: theme.textSoft, lineHeight: 1.4,
                  marginTop: 3, 
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>{bowl.desc}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{
                  fontWeight: 800, fontSize: 16, color: theme.accent,
                  marginBottom: 6,
                }}>€{bowl.price.toFixed(2)}</div>
                <button onClick={() => addPresetToCart(bowl)} style={{
                  background: theme.accent,
                  border: "none", borderRadius: 10,
                  color: "#fff", fontSize: 18,
                  width: 36, height: 36,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "transform 0.15s, box-shadow 0.15s",
                  boxShadow: "0 2px 8px rgba(212,118,60,0.3)",
                }}
                  onMouseDown={e => e.currentTarget.style.transform = "scale(0.92)"}
                  onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                >+</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Build your own CTA */}
      <div style={{ padding: "8px 16px 24px" }}>
        <button onClick={() => { setView("build"); setActiveCategory("basi"); }} style={{
          width: "100%",
          padding: "18px 20px",
          background: `linear-gradient(135deg, ${theme.green}, #3d7a40)`,
          border: "none", borderRadius: 16,
          color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          boxShadow: "0 4px 16px rgba(90,143,92,0.3)",
          fontFamily: "'Playfair Display', Georgia, serif",
          transition: "transform 0.15s",
        }}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <span style={{ fontSize: 24 }}>🎨</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>Crea la tua Bowl</div>
            <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 400, fontFamily: "'DM Sans', sans-serif" }}>
              Scegli ogni ingrediente — €{CUSTOM_BOWL_PRICE.toFixed(2)}
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
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 18, fontWeight: 700, color: theme.text,
            }}>Crea la tua Bowl</div>
            <div style={{ fontSize: 12, color: theme.textSoft }}>€{CUSTOM_BOWL_PRICE.toFixed(2)}</div>
          </div>
        </div>

        {/* Progress dots */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 6,
          padding: "14px 16px 8px",
          background: theme.bg,
        }}>
          {catOrder.map((c, i) => {
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
          fontFamily: "'Playfair Display', Georgia, serif",
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
            <div style={{ fontSize: 13, marginTop: 6 }}>Aggiungi una bowl per iniziare</div>
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

            {/* Total & Send */}
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
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}>€{totalPrice.toFixed(2)}</span>
              </div>
              <button onClick={sendOrder} style={{
                width: "100%", padding: "16px",
                background: "linear-gradient(135deg, #25d366, #128c7e)",
                border: "none", borderRadius: 14,
                color: "#fff", fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: "0 4px 16px rgba(37,211,102,0.3)",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                Invia ordine su WhatsApp
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

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
          fontFamily: "'Playfair Display', Georgia, serif",
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
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      {orderSent ? renderConfirm() : (
        <>
          {view === "menu" && renderMenu()}
          {view === "build" && renderBuild()}
          {view === "cart" && renderCart()}

          {/* Floating cart button */}
          {view !== "cart" && view !== "build" && cart.length > 0 && (
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
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: #b8a080; }
      `}</style>
    </div>
  );
}
