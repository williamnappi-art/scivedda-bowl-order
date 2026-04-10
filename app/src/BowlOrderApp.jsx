import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";
import { useTranslation } from "react-i18next";

// ── Menu Data (in production, this comes from admin panel / API) ──────────
// Builder categories — built with t() inside component via getMenuCategories(t)
const getMenuCategories = (t) => ({
  basi: {
    label: t("builder.basi_label"),
    emoji: "🍚",
    color: "#f5e6d3",
    items: [
      { id: "fregola",          name: t("builder.fregola_name"),          cal: 150, icon: "🟤" },
      { id: "riso-bianco",      name: t("builder.riso-bianco_name"),      cal: 130, icon: "🍚" },
      { id: "riso-rosso",       name: t("builder.riso-rosso_name"),       cal: 125, icon: "🔴" },
      { id: "riso-nero",        name: t("builder.riso-nero_name"),        cal: 120, icon: "⚫" },
      { id: "farro",            name: t("builder.farro_name"),            cal: 140, icon: "🌾" },
      { id: "insalata",         name: t("builder.insalata_name"),         cal: 20,  icon: "🥬" },
      { id: "riso-insalata",    name: t("builder.riso-insalata_name"),    cal: 90,  icon: "🍱" },
      { id: "fregola-insalata", name: t("builder.fregola-insalata_name"), cal: 95,  icon: "🥗" },
    ],
  },
  proteine: {
    label: t("builder.proteine_label"),
    emoji: "🐟",
    color: "#ffd6d6",
    items: [
      { id: "salmone-crudo",       name: t("builder.salmone-crudo_name"),       cal: 180, icon: "🍣" },
      { id: "salmone-cotto",       name: t("builder.salmone-cotto_name"),       cal: 170, icon: "🐟" },
      { id: "tonno-crudo",         name: t("builder.tonno-crudo_name"),         cal: 160, icon: "🔴" },
      { id: "tonno-cotto",         name: t("builder.tonno-cotto_name"),         cal: 150, icon: "🫙" },
      { id: "gambero-cotto",       name: t("builder.gambero-cotto_name"),       cal: 100, icon: "🦐", extra: 2 },
      { id: "polpo",               name: t("builder.polpo_name"),               cal: 120, icon: "🐙", extra: 3 },
      { id: "uovo-pula",           name: t("builder.uovo-pula_name"),           cal: 90,  icon: "🥚" },
      { id: "maiale-sfilacciato",  name: t("builder.maiale-sfilacciato_name"),  cal: 200, icon: "🥩", extra: 3 },
      { id: "polletto",            name: t("builder.polletto_name"),            cal: 170, icon: "🍗" },
      { id: "tofu-naturale",       name: t("builder.tofu-naturale_name"),       cal: 90,  icon: "🧈" },
      { id: "legumi",              name: t("builder.legumi_name"),              cal: 130, icon: "🫘" },
    ],
  },
  verdure: {
    label: t("builder.verdure_label"),
    emoji: "🥑",
    color: "#d4edda",
    items: [
      { id: "avocado",          name: t("builder.avocado_name"),          cal: 80,  icon: "🥑", extra: 1.5 },
      { id: "cipolla-rossa",    name: t("builder.cipolla-rossa_name"),    cal: 10,  icon: "🧅" },
      { id: "olive-parteolla",  name: t("builder.olive-parteolla_name"),  cal: 40,  icon: "🫒" },
      { id: "cetriolo",         name: t("builder.cetriolo_name"),         cal: 15,  icon: "🥒" },
      { id: "frutta-stagione",  name: t("builder.frutta-stagione_name"),  cal: 50,  icon: "🍓" },
      { id: "pomodorini-pula",  name: t("builder.pomodorini-pula_name"),  cal: 18,  icon: "🍅" },
      { id: "edamame",          name: t("builder.edamame_name"),          cal: 120, icon: "🫛" },
      { id: "ananas",           name: t("builder.ananas_name"),           cal: 40,  icon: "🍍" },
      { id: "mais",             name: t("builder.mais_name"),             cal: 35,  icon: "🌽" },
      { id: "jalapeno",         name: t("builder.jalapeno_name"),         cal: 5,   icon: "🌶️" },
      { id: "mango",            name: t("builder.mango_name"),            cal: 60,  icon: "🥭", extra: 1 },
      { id: "carote",           name: t("builder.carote_name"),           cal: 20,  icon: "🥕" },
      { id: "ceci",             name: t("builder.ceci_name"),             cal: 130, icon: "🫘" },
      { id: "zucchina-fritta",  name: t("builder.zucchina-fritta_name"),  cal: 70,  icon: "🥬", extra: 1.5 },
      { id: "cavolo-viola",     name: t("builder.cavolo-viola_name"),     cal: 25,  icon: "🫐" },
      { id: "finocchio",        name: t("builder.finocchio_name"),        cal: 20,  icon: "🌿" },
      { id: "verdura-stagione", name: t("builder.verdura-stagione_name"), cal: 30,  icon: "🥦", extra: 1.5 },
      { id: "pomodoro-secco",   name: t("builder.pomodoro-secco_name"),   cal: 45,  icon: "🔴" },
    ],
  },
  croccanti: {
    label: t("builder.croccanti_label"),
    emoji: "✨",
    color: "#fdf3e3",
    items: [
      { id: "chips-cipolla", name: t("builder.chips-cipolla_name"), cal: 45, icon: "🧅" },
      { id: "semi-zucca",    name: t("builder.semi-zucca_name"),    cal: 35, icon: "🎃" },
      { id: "sesamo",        name: t("builder.sesamo_name"),        cal: 20, icon: "⬜" },
      { id: "zenzero-rosa",  name: t("builder.zenzero-rosa_name"),  cal: 10, icon: "🌸", extra: 0.5 },
      { id: "noci",          name: t("builder.noci_name"),          cal: 65, icon: "🫘" },
      { id: "mandorle",      name: t("builder.mandorle_name"),      cal: 60, icon: "🌰" },
      { id: "semi-canapa",   name: t("builder.semi-canapa_name"),   cal: 30, icon: "🌿" },
      { id: "anacardi",      name: t("builder.anacardi_name"),      cal: 55, icon: "🥜", extra: 0.5 },
      { id: "pistacchio",    name: t("builder.pistacchio_name"),    cal: 60, icon: "💚", extra: 0.5 },
      { id: "kataifi",       name: t("builder.kataifi_name"),       cal: 50, icon: "🥐", extra: 1 },
    ],
  },
  salse: {
    label: t("builder.salse_label"),
    emoji: "🫗",
    color: "#fff3cd",
    items: [
      { id: "soia",            name: t("builder.soia_name"),            cal: 10, icon: "🫗" },
      { id: "wasabi-maio",     name: t("builder.wasabi-maio_name"),     cal: 40, icon: "🟢" },
      { id: "sale-zenzero",    name: t("builder.sale-zenzero_name"),    cal: 5,  icon: "🧂" },
      { id: "teriyaki",        name: t("builder.teriyaki_name"),        cal: 25, icon: "🍯" },
      { id: "zenzero-maio",    name: t("builder.zenzero-maio_name"),    cal: 40, icon: "🫚" },
      { id: "spicy-maio",      name: t("builder.spicy-maio_name"),      cal: 45, icon: "🌶️" },
      { id: "yogurt-dressing", name: t("builder.yogurt-dressing_name"), cal: 35, icon: "🥛" },
      { id: "maio-tartufo",    name: t("builder.maio-tartufo_name"),    cal: 50, icon: "🍄", extra: 0.5 },
      { id: "olio-evo",        name: t("builder.olio-evo_name"),        cal: 90, icon: "🫒" },
      { id: "sale",            name: t("builder.sale_name"),            cal: 0,  icon: "🧂" },
      { id: "wasabi",          name: t("builder.wasabi_name"),          cal: 5,  icon: "🌿" },
    ],
  },
  special: {
    label: t("builder.special_label"),
    emoji: "⭐",
    color: "#f0e6f6",
    items: [
      { id: "caprino",        name: t("builder.caprino_name"),        cal: 70,  icon: "🧀", extra: 1 },
      { id: "cipolla-cara",   name: t("builder.cipolla-cara_name"),   cal: 55,  icon: "🧅", extra: 1 },
      { id: "ricotta-mustia", name: t("builder.ricotta-mustia_name"), cal: 80,  icon: "🔶", extra: 1 },
      { id: "philadelphia",   name: t("builder.philadelphia_name"),   cal: 90,  icon: "🫙", extra: 1 },
      { id: "bufala",         name: t("builder.bufala_name"),         cal: 100, icon: "🫗", extra: 1 },
      { id: "casu-axedu",     name: t("builder.casu-axedu_name"),     cal: 65,  icon: "🍶", extra: 1 },
      { id: "bottarga",       name: t("builder.bottarga_name"),       cal: 40,  icon: "🟠", extra: 1 },
      { id: "wakame",         name: t("builder.wakame_name"),         cal: 15,  icon: "🌿", extra: 1 },
      { id: "pane-guttiau",   name: t("builder.pane-guttiau_name"),   cal: 60,  icon: "🫓", extra: 1 },
    ],
  },
});

const ALLERGEN_EMOJIS = {
  glutine: "🌾", uova: "🥚", latte: "🥛",
  pesce: "🐟", crostacei: "🦐", soia: "🫘",
  sesamo: "⬜", fruttaGuscio: "🌰",
  sedano: "🌿", solfiti: "🍷", molluschi: "🦪",
  arachidi: "🥜", senape: "🌼",
};

// Returns allergen label using translations
const getAllergenLabel = (key, t) => {
  const emoji = ALLERGEN_EMOJIS[key] || "";
  return `${emoji} ${t(`allergens.${key}`, key)}`;
};

// MENU_SECTIONS is built dynamically inside the component using t() — see getMenuSections(t) below
const getMenuSections = (t) => [
  {
    id: "special",
    label: t("menu_sections.special_label"),
    subtitle: t("menu_sections.special_subtitle"),
    emoji: "⭐",
    items: [
      { id: "hummus-polpette", name: t("menu_items.hummus-polpette_name"), desc: t("menu_items.hummus-polpette_desc"), price: 12.90, allergens: ["latte", "fruttaGuscio", "soia"], vegetarian: true, vegan: false },
      { id: "civraxu-crudo-mare", name: t("menu_items.civraxu-crudo-mare_name"), desc: t("menu_items.civraxu-crudo-mare_desc"), price: 12.90, allergens: ["glutine", "latte", "pesce", "fruttaGuscio"], vegetarian: false, vegan: false },
      { id: "civraxu-orto", name: t("menu_items.civraxu-orto_name"), desc: t("menu_items.civraxu-orto_desc"), price: 12.90, allergens: ["glutine", "latte", "fruttaGuscio"], vegetarian: true, vegan: false },
      { id: "crudi-giorno", name: t("menu_items.crudi-giorno_name"), desc: t("menu_items.crudi-giorno_desc"), price: 12.90, allergens: ["glutine", "pesce", "fruttaGuscio"], vegetarian: false, vegan: false },
      { id: "guttiau-chips", name: t("menu_items.guttiau-chips_name"), desc: t("menu_items.guttiau-chips_desc"), price: 12.90, allergens: ["glutine", "pesce", "uova"], vegetarian: false, vegan: false },
    ],
  },
  {
    id: "pistoccu",
    label: t("menu_sections.pistoccu_label"),
    subtitle: t("menu_sections.pistoccu_subtitle"),
    emoji: "🫓",
    items: [
      { id: "pistoccu-maialetto", name: t("menu_items.pistoccu-maialetto_name"), desc: t("menu_items.pistoccu-maialetto_desc"), sizes: { regular: 13.90, xl: 16.90 }, allergens: ["latte", "glutine", "sesamo", "fruttaGuscio"], vegetarian: false, vegan: false },
      { id: "pistoccu-polletto", name: t("menu_items.pistoccu-polletto_name"), desc: t("menu_items.pistoccu-polletto_desc"), sizes: { regular: 13.90, xl: 16.90 }, allergens: ["glutine", "latte", "soia", "fruttaGuscio", "sesamo"], vegetarian: false, vegan: false },
      { id: "pistoccu-polpo", name: t("menu_items.pistoccu-polpo_name"), desc: t("menu_items.pistoccu-polpo_desc"), sizes: { regular: 14.90, xl: 17.90 }, allergens: ["glutine", "fruttaGuscio", "sesamo", "latte"], vegetarian: false, vegan: false },
      { id: "pistoccu-veg", name: t("menu_items.pistoccu-veg_name"), desc: t("menu_items.pistoccu-veg_desc"), sizes: { regular: 13.90, xl: 16.90 }, allergens: ["glutine", "soia", "fruttaGuscio", "latte"], vegetarian: true, vegan: false },
      { id: "pistoccu-crudi-mare", name: t("menu_items.pistoccu-crudi-mare_name"), desc: t("menu_items.pistoccu-crudi-mare_desc"), sizes: { regular: 13.90, xl: 16.90 }, allergens: ["glutine", "latte", "soia", "sesamo", "fruttaGuscio"], vegetarian: false, vegan: false },
    ],
  },
  {
    id: "scivedde",
    label: t("menu_sections.scivedde_label"),
    subtitle: t("menu_sections.scivedde_subtitle"),
    emoji: "🥣",
    items: [
      { id: "scivedda-tabule", name: t("menu_items.scivedda-tabule_name"), desc: t("menu_items.scivedda-tabule_desc"), sizes: { base: 13.90, tartare: 17.40 }, sizeLabels: { base: "€13,90", tartare: t("menu_items.scivedda-tabule_tartare_label") }, suggestion: t("menu_items.scivedda-tabule_suggestion"), allergens: ["glutine", "fruttaGuscio"], vegetarian: true, vegan: true },
      { id: "scivedda-polletto", name: t("menu_items.scivedda-polletto_name"), desc: t("menu_items.scivedda-polletto_desc"), warning: t("menu_items.scivedda-polletto_warning"), sizes: { small: 12.90, media: 15.90 }, sizeLabels: { small: "Small", media: "Media" }, allergens: ["latte", "glutine", "fruttaGuscio"], vegetarian: false, vegan: false },
      { id: "scivedda-tonno-tartufo", name: t("menu_items.scivedda-tonno-tartufo_name"), desc: t("menu_items.scivedda-tonno-tartufo_desc"), sizes: { base: 13.90, xl: 16.90 }, sizeLabels: { base: "€13,90", xl: "XL" }, allergens: ["glutine", "pesce", "soia"], vegetarian: false, vegan: false },
      { id: "scivedda-salmone-crudo", name: t("menu_items.scivedda-salmone-crudo_name"), desc: t("menu_items.scivedda-salmone-crudo_desc"), sizes: { base: 12.90, xl: 15.90 }, sizeLabels: { base: "€12,90", xl: "XL" }, allergens: ["pesce", "latte", "soia", "sesamo"], vegetarian: false, vegan: false },
      { id: "scivedda-orata", name: t("menu_items.scivedda-orata_name"), desc: t("menu_items.scivedda-orata_desc"), sizes: { small: 13.90, regular: 16.90 }, sizeLabels: { small: "Small", regular: "Regular" }, allergens: ["fruttaGuscio", "pesce"], vegetarian: false, vegan: false },
      { id: "scivedda-polpo", name: t("menu_items.scivedda-polpo_name"), desc: t("menu_items.scivedda-polpo_desc"), sizes: { small: 13.90, regular: 16.90 }, sizeLabels: { small: "Small", regular: "Regular" }, allergens: ["glutine", "pesce", "fruttaGuscio"], vegetarian: false, vegan: false },
      { id: "scivedda-salmone", name: t("menu_items.scivedda-salmone_name"), desc: t("menu_items.scivedda-salmone_desc"), sizes: { small: 12.90, regular: 15.90 }, sizeLabels: { small: "Small", regular: "Regular" }, allergens: ["latte", "glutine", "pesce"], vegetarian: false, vegan: false },
    ],
  },
  {
    id: "culurgionis",
    label: t("menu_sections.culurgionis_label"),
    subtitle: t("menu_sections.culurgionis_subtitle"),
    emoji: "🥟",
    items: [
      { id: "culurgionis-tradizionali", name: t("menu_items.culurgionis-tradizionali_name"), desc: t("menu_items.culurgionis-tradizionali_desc"), price: 10.90, allergens: ["glutine", "latte"], vegetarian: true, vegan: false },
      { id: "culurgionis-scivedda", name: t("menu_items.culurgionis-scivedda_name"), desc: t("menu_items.culurgionis-scivedda_desc"), price: 10.90, allergens: ["glutine", "latte"], vegetarian: false, vegan: false },
    ],
  },
  {
    id: "panedda",
    label: t("menu_sections.panedda_label"),
    subtitle: t("menu_sections.panedda_subtitle"),
    emoji: "🥙",
    items: [
      { id: "panedda-salmone", name: t("menu_items.panedda-salmone_name"), desc: t("menu_items.panedda-salmone_desc"), price: 9.50, allergens: ["glutine", "pesce", "sesamo"], vegetarian: false, vegan: false, popular: true },
      { id: "panedda-porchetta", name: t("menu_items.panedda-porchetta_name"), desc: t("menu_items.panedda-porchetta_desc"), price: 9.00, allergens: ["glutine", "uova", "senape"], vegetarian: false, vegan: false, popular: true },
      { id: "panedda-tonno", name: t("menu_items.panedda-tonno_name"), desc: t("menu_items.panedda-tonno_desc"), price: 8.50, allergens: ["glutine", "pesce"], vegetarian: false, vegan: false },
      { id: "panedda-culurgionis", name: t("menu_items.panedda-culurgionis_name"), desc: t("menu_items.panedda-culurgionis_desc"), price: 11.00, allergens: ["glutine", "latte", "uova"], vegetarian: true, vegan: false },
      { id: "panedda-veggie", name: t("menu_items.panedda-veggie_name"), desc: t("menu_items.panedda-veggie_desc"), price: 8.00, allergens: ["glutine", "sesamo"], vegetarian: true, vegan: true },
    ],
  },
  {
    id: "dolcetti",
    label: t("menu_sections.dolcetti_label"),
    subtitle: t("menu_sections.dolcetti_subtitle"),
    emoji: "🍯",
    items: [
      { id: "seadas", name: t("menu_items.seadas_name"), desc: t("menu_items.seadas_desc"), price: 5.00, allergens: ["glutine", "latte", "uova"], vegetarian: true, vegan: false },
      { id: "formagelle", name: t("menu_items.formagelle_name"), desc: t("menu_items.formagelle_desc"), price: 4.50, allergens: ["latte", "fruttaGuscio"], vegetarian: true, vegan: false },
      { id: "frutta", name: t("menu_items.frutta_name"), desc: t("menu_items.frutta_desc"), price: 4.00, allergens: [], vegetarian: true, vegan: true },
      { id: "pistoccu-dolce", name: t("menu_items.pistoccu-dolce_name"), desc: t("menu_items.pistoccu-dolce_desc"), price: 4.50, allergens: ["glutine", "fruttaGuscio"], vegetarian: true, vegan: true },
    ],
  },
  {
    id: "dabare",
    label: t("menu_sections.dabare_label"),
    subtitle: t("menu_sections.dabare_subtitle"),
    emoji: "🍷",
    items: [
      { id: "vino-rosso", name: t("menu_items.vino-rosso_name"), desc: t("menu_items.vino-rosso_desc"), sizes: { calice: 3.50, bottiglia: 12.90 }, sizeLabels: { calice: t("menu_items.calice_label"), bottiglia: t("menu_items.bottiglia_label") }, allergens: ["solfiti"], vegetarian: true, vegan: true },
      { id: "vino-bianco", name: t("menu_items.vino-bianco_name"), desc: t("menu_items.vino-bianco_desc"), sizes: { calice: 3.50, bottiglia: 12.90 }, sizeLabels: { calice: t("menu_items.calice_label"), bottiglia: t("menu_items.bottiglia_label") }, allergens: ["solfiti"], vegetarian: true, vegan: true },
      { id: "kombucha-mojito", name: t("menu_items.kombucha-mojito_name"), desc: t("menu_items.kombucha-mojito_desc"), price: 6.00, allergens: [], vegetarian: true, vegan: true },
      { id: "kombucha", name: t("menu_items.kombucha_name"), desc: t("menu_items.kombucha_desc"), price: 6.00, allergens: [], vegetarian: true, vegan: true },
      { id: "ichnusa", name: t("menu_items.ichnusa_name"), desc: t("menu_items.ichnusa_desc"), price: 3.00, allergens: ["glutine"], vegetarian: true, vegan: true },
      { id: "soft-drinks", name: t("menu_items.soft-drinks_name"), desc: t("menu_items.soft-drinks_desc"), price: 3.00, allergens: [], vegetarian: true, vegan: true },
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


const IngredientCard = React.memo(function IngredientCard({ item, sel, isDouble, catColor, theme, category, onSelect, onTogglePortion }) {
  return (
    <button
      onClick={(e) => { if (e.detail >= 2) return; onSelect(category, item.id); }}
      onDoubleClick={() => { if (!sel) onSelect(category, item.id); if (category !== "basi") onTogglePortion(category, item.id); }}
      style={{
        background: "#faf7f2",
        border: isDouble ? `2px solid #e53e3e` : sel ? `2.5px solid ${theme.accent}` : `1.5px solid ${theme.border}`,
        borderRadius: 16, padding: 0, cursor: "pointer",
        display: "flex", flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s", transform: sel ? "scale(1.04)" : "scale(1)",
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
const LANGUAGES = [
  { code: "it", label: "ITA", flag: "🇮🇹" },
  { code: "en", label: "ENG", flag: "🇬🇧" },
  { code: "de", label: "DEU", flag: "🇩🇪" },
  { code: "fr", label: "FRA", flag: "🇫🇷" },
];

export default function BowlOrderApp() {
  const { t, i18n } = useTranslation();
  const MENU_CATEGORIES = getMenuCategories(t);
  const MENU_SECTIONS = getMenuSections(t);
  const [view, setView] = useState("menu"); // menu | build | cart | summary | confirm
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState({ size: null, basi: [], proteine: [], verdure: [], croccanti: [], salse: [], special: [] });
  const [portions, setPortions] = useState({});
  const [activeCategory, setActiveCategory] = useState("size");
  const [customerName, setCustomerName] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [diningOption, setDiningOption] = useState(null); // "qui" | "via"
  const [orderSent, setOrderSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [showCartBounce, setShowCartBounce] = useState(false);
  const [warnedStep, setWarnedStep] = useState(null);
  const [bowlName, setBowlName] = useState("");
  const [bowlNameEdited, setBowlNameEdited] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const [photoModal, setPhotoModal] = useState(null);
  const [modalSize, setModalSize] = useState(null);
  const [langOpen, setLangOpen] = useState(false);

  // ── Admin state ──────────────────────────────────────────────────────
  const [adminSession, setAdminSession] = useState(null);
  const [adminView, setAdminView] = useState(false);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [dbSaveError, setDbSaveError] = useState(false);
  const logoTapCount = useRef(0);
  const logoTapTimer = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setAdminSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setAdminSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.body.style.background = view === "menu" && !adminView && !orderSent ? "#6b8c6e" : "#faf7f2";
    const viewport = document.querySelector("meta[name=viewport]");
    if (viewport) {
      viewport.content = view === "build"
        ? "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        : "width=device-width, initial-scale=1";
    }
  }, [view, adminView, orderSent]);

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
    if (error) setAdminLoginError(t("ui.admin_login_error"));
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
    await supabase.from("orders").update({ whatsapp_confirmed: true }).eq("id", orderId);
    setAdminOrders(prev => prev.map(o => o.id === orderId ? { ...o, whatsapp_confirmed: true } : o));
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
    const dining = order.dining_option === "qui" ? `<div class="dining">🍽 MANGIO QUI</div>` : order.dining_option === "via" ? `<div class="dining">🛍 PORTO VIA</div>` : "";

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
          ${dining}
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
      .dining { font-size: 16px; font-weight: 900; margin-bottom: 4px; }
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
  const togglePortion = useCallback((category, itemId) => {
    const key = `${category}_${itemId}`;
    setPortions(prev => ({ ...prev, [key]: prev[key] === 2 ? 1 : 2 }));
  }, []);

  const catOrder = ["size", "basi", "proteine", "verdure", "croccanti", "salse", "special"];

  const selectIngredient = useCallback((category, itemId) => {
    setSelected(prev => {
      const next = { ...prev };
      const MAX = { basi: MAX_BASI, proteine: MAX_PROTEINE, verdure: MAX_VERDURE, croccanti: MAX_CROCCANTI, salse: MAX_SALSE };
      const max = MAX[category] ?? Infinity;
      if (next[category].includes(itemId)) {
        next[category] = next[category].filter(x => x !== itemId);
      } else if (next[category].length < max) {
        next[category] = [...next[category], itemId];
      }
      return next;
    });

    // Pulisce la porzione quando si deseleziona
    setPortions(prev => {
      const key = `${category}_${itemId}`;
      if (!prev[key]) return prev;
      const n = { ...prev };
      delete n[key];
      return n;
    });
  }, []);

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

    const resolvedBowlName = bowlName.trim() || customerName.trim() || t("ui.admin_anonymous");
    setCart(prev => [...prev, {
      id: Date.now(),
      type: "custom",
      name: t("ui.scivedda_di", { name: resolvedBowlName }),
      desc,
      items: bowlItems,
      portions: bowlPortions,
      price: customPrice,
      qty: 1,
    }]);
    setSelected({ size: null, basi: [], proteine: [], verdure: [], croccanti: [], salse: [], special: [] });
    setPortions(prev => { const next = { ...prev }; Object.keys(bowlPortions).forEach(k => delete next[k]); return next; });
    setBowlName("");
    setBowlNameEdited(false);
    setActiveCategory("size");
    setView("cart");
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
    if (sending) return;
    setSending(true);

    const finalCode = await generateOrderCode();
    const text = buildOrderText(finalCode);
    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
    const waUrl = isMobile
      ? `whatsapp://send?phone=${WA_BUSINESS_NUMBER}&text=${encodeURIComponent(text)}`
      : `https://wa.me/${WA_BUSINESS_NUMBER}?text=${encodeURIComponent(text)}`;
    window.location.href = waUrl;
    setOrderSent(true);

    // Salva su Supabase in background
    try {
      const orderId = crypto.randomUUID();
      const { error: orderError } = await supabase.from("orders").insert({
        id: orderId,
        customer_name: customerName || null,
        customer_note: customerNote || null,
        dining_option: diningOption || null,
        total: totalPrice,
        status: "nuovo",
        order_code: finalCode,
      });
      if (orderError) { console.error("ORDER INSERT ERROR:", orderError); setDbSaveError(true); return; }

      const items = cart.map(item => ({
        order_id: orderId,
        item_name: item.name,
        item_type: item.type,
        price: item.price,
        qty: item.qty,
        details: item.type === "custom" ? { ...item.items, portions: item.portions || {} } : null,
      }));
      const { error: itemsError } = await supabase.from("order_items").insert(items);
      if (itemsError) { console.error("ITEMS INSERT ERROR:", itemsError); setDbSaveError(true); }
    } catch (e) {
      console.error("Supabase exception:", e);
      setDbSaveError(true);
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
    <div style={{ paddingBottom: cart.length > 0 ? 100 : 32, background: "#6b8c6e", minHeight: "100vh" }}>
      {/* Language selector */}
      <div style={{ padding: "12px 16px 0", position: "relative", width: "fit-content" }}>
        {/* Trigger pill */}
        <button
          onClick={() => setLangOpen(o => !o)}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.35)",
            color: "#fff", borderRadius: 20, padding: "7px 14px",
            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {LANGUAGES.find(l => l.code === i18n.language)?.flag}{" "}
          {LANGUAGES.find(l => l.code === i18n.language)?.label}
          <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 2 }}>▾</span>
        </button>
        {/* Dropdown */}
        {langOpen && (
          <>
            {/* overlay per chiudere cliccando fuori */}
            <div onClick={() => setLangOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 100,
              background: "#3d5c40", borderRadius: 14, overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.15)",
              minWidth: 120,
            }}>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "10px 16px",
                    background: i18n.language === lang.code ? "rgba(255,255,255,0.15)" : "transparent",
                    border: "none", color: "#fff", fontSize: 13, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  }}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "24px 20px 24px" }}>
        <img
          src="/logo-home-scivedda.png"
          alt="Scivedda"
          onClick={handleLogoTap}
          style={{ width: 200, display: "block", margin: "0 auto 12px", cursor: "default", userSelect: "none" }}
        />
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
          {t("ui.tagline")}
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
            background: "linear-gradient(135deg, #f5c842, #e6b020)",
            border: "none", borderRadius: 18,
            color: "#2d2418", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            boxShadow: "0 6px 24px rgba(245,200,66,0.4)",
            fontFamily: "'Jaapokki', sans-serif",
            transition: "transform 0.15s",
          }}
        >
          <span style={{ fontSize: 24 }}>🎨</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 17, letterSpacing: 1, textTransform: "uppercase" }}>{t("ui.cta_build_title")}</div>
            <div style={{ fontSize: 11, opacity: 0.85, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
              {t("ui.cta_build_subtitle")}
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
                      }} onClick={() => { setPhotoModal({ ...item, sectionEmoji: section.emoji }); setModalSize(null); }}>
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
                              <span style={{ background: "#2e7d32", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 6px", borderRadius: 5, display: "flex", alignItems: "center", gap: 2 }}>🌱 Vegan</span>
                            )}
                            {!item.vegan && item.vegetarian && (
                              <span style={{ background: "#558b2f", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 6px", borderRadius: 5, display: "flex", alignItems: "center", gap: 2 }}>🌿 Veg</span>
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
                              {item.sizes ? `€${Object.values(item.sizes)[0].toFixed(2)}` : item.price ? `€${item.price.toFixed(2)}` : "—"}
                            </span>
                            {(item.price || item.sizes) && (
                              <button onClick={e => { e.stopPropagation(); if (item.sizes) { setPhotoModal({ ...item, sectionEmoji: section.emoji }); setModalSize(null); } else { addMenuItemToCart(item); } }} style={{
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
      <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: theme.bg, zIndex: 10 }}>
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
            }}>{t("ui.build_title")}</div>
            <div style={{ fontSize: 12, color: theme.textSoft }}>
              {selected.size ? `€${customPrice.toFixed(2)}` : t("ui.build_size_label")}
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

        {/* Chips riepilogo selezioni */}
        {(() => {
          const chips = [];
          if (selected.size) chips.push({ label: SIZE_OPTIONS.find(s => s.id === selected.size)?.label || selected.size, cat: "size" });
          ["basi","proteine","verdure","croccanti","salse","special"].forEach(cat => {
            (selected[cat] || []).forEach(id => {
              const item = MENU_CATEGORIES[cat]?.items.find(i => i.id === id);
              if (item) chips.push({ label: item.name, cat });
            });
          });
          if (!chips.length) return (
            <div style={{ padding: "6px 16px 2px", minHeight: 32, display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: theme.textSoft, fontStyle: "italic" }}>{t("ui.build_no_selection")}</span>
            </div>
          );
          return (
            <div style={{ padding: "6px 16px 2px", display: "flex", flexWrap: "wrap", gap: 6, minHeight: 32 }}>
              {chips.map((chip, i) => (
                <span key={i} style={{
                  fontSize: 11, fontWeight: 600,
                  background: theme.accentLight, color: theme.accent,
                  border: `1px solid ${theme.accent}33`,
                  borderRadius: 20, padding: "3px 10px",
                  whiteSpace: "nowrap",
                }}>{chip.label}</span>
              ))}
            </div>
          );
        })()}

        {/* Selector panel */}
        <div style={{
          flex: 1, background: theme.card,
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          border: `1px solid ${theme.border}`, borderBottom: "none",
          padding: "16px 16px 24px",
          marginTop: 4, boxShadow: "0 -4px 20px rgba(0,0,0,0.05)",
          overflowY: "auto",
        }}>

          {/* ── SIZE STEP ── */}
          {isSize && (
            <>
              {/* Nome cliente — solo sulla prima bowl */}
              {cart.filter(i => i.type === "custom").length === 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 6 }}>
                    {t("ui.build_your_name")}
                  </div>
                  <input
                    value={customerName}
                    onChange={e => { setCustomerName(e.target.value); if (!bowlNameEdited) setBowlName(e.target.value); }}
                    placeholder={t("ui.build_your_name_placeholder")}
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
                    {customerName.trim() ? t("ui.build_your_name_appears") : t("ui.build_your_name_required")}
                  </div>
                </div>
              )}

              {/* Per chi è questa Scivedda? */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 6 }}>
                  {cart.filter(i => i.type === "custom").length === 0 ? t("ui.build_bowl_for_whom") : `🥣 ${t("ui.build_bowl_for_whom_alt")}`}
                </div>
                <input
                  value={bowlName}
                  onChange={e => { setBowlName(e.target.value); setBowlNameEdited(true); }}
                  placeholder={cart.filter(i => i.type === "custom").length === 0 ? `${customerName || t("ui.build_your_name").toLowerCase()}` : t("ui.build_bowl_friend_placeholder")}
                  style={{
                    width: "100%", padding: "13px 14px",
                    borderRadius: 12, fontSize: 15, fontFamily: "inherit",
                    border: `2px solid ${cart.filter(i => i.type === "custom").length > 0 && !bowlName.trim() ? "#ef4444" : theme.accent}`,
                    background: theme.bg,
                    color: theme.text, outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ fontSize: 11, color: theme.textSoft, marginTop: 4 }}>
                  {cart.filter(i => i.type === "custom").length === 0
                    ? t("ui.build_bowl_leave_empty")
                    : t("ui.build_bowl_distinguish")}
                </div>
              </div>

              <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 4 }}>
                {t("ui.build_size_choose")}
              </div>
              <div style={{ fontSize: 11, color: theme.textSoft, marginBottom: 18 }}>
                {selected.size ? `✓ ${t("ui.build_size_selected")}` : t("ui.build_size_select_one")}
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
                        transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
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
                        <defs>
                          <linearGradient id={`bG-${sz.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e8d5b7" /><stop offset="100%" stopColor="#c9a96e" /></linearGradient>
                          <linearGradient id={`rG-${sz.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f5e6d3" /><stop offset="100%" stopColor="#e8d5b7" /></linearGradient>
                          <radialGradient id={`iG-${sz.id}`}><stop offset="0%" stopColor="#faf6f0" /><stop offset="100%" stopColor="#f0e6d8" /></radialGradient>
                        </defs>
                        <ellipse cx="50" cy="72" rx="40" ry="5" fill="rgba(0,0,0,0.06)" />
                        <path d="M10,35 Q10,68 50,70 Q90,68 90,35 Z" fill={`url(#bG-${sz.id})`} stroke="#d4a373" strokeWidth="0.8" />
                        <ellipse cx="50" cy="35" rx="42" ry="14" fill={`url(#rG-${sz.id})`} stroke="#d4a373" strokeWidth="0.6" />
                        <ellipse cx="50" cy="36" rx="38" ry="11.5" fill={`url(#iG-${sz.id})`} />
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
                  {cat.emoji} {t("ui.build_choose_ingredient", { label: cat.label.toLowerCase() })}
                </div>
                <div style={{ fontSize: 11, color: theme.textSoft, marginTop: 2 }}>
                  {activeCategory === "proteine"
                    ? t("ui.build_proteine_hint", { limit, count: currentCount })
                    : activeCategory === "verdure"
                    ? t("ui.build_verdure_hint", { limit, count: currentCount })
                    : activeCategory === "croccanti"
                    ? t("ui.build_croccanti_hint", { limit, count: currentCount })
                    : activeCategory === "salse"
                    ? t("ui.build_salse_hint", { limit, count: currentCount })
                    : activeCategory === "special"
                    ? t("ui.build_special_hint", { count: currentCount })
                    : isMulti
                    ? t("ui.build_multi_hint", { limit, count: currentCount })
                    : t("ui.build_size_select_one")
                  }
                </div>
              </div>
              {activeCategory !== "basi" && (
                <div style={{ fontSize: 10, color: theme.textSoft, marginBottom: 10, opacity: 0.7 }}>
                  {t("ui.build_double_tap")}
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
                      category={activeCategory}
                      onSelect={selectIngredient}
                      onTogglePortion={togglePortion}
                    />
                  );
                })}
              </div>
            </>
          )}

        </div>

        {/* Bottom bar: price + navigation — fixed via flex layout */}
        <div style={{
          flexShrink: 0,
          position: "relative",
          background: "#fff",
          borderTop: `1px solid ${theme.border}`,
          padding: "10px 14px 22px",
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
        }}>
          {/* Price chip */}
          <div style={{
            background: theme.warm, borderRadius: 10,
            padding: "6px 10px", flexShrink: 0,
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <span style={{ fontSize: 9, color: theme.textSoft, textTransform: "uppercase", letterSpacing: 0.5 }}>{t("ui.build_total_label")}</span>
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
                if (catIdx === 0 && !customerName.trim()) msg = t("ui.build_err_name");
                else if (catIdx === 0 && !selected.size) msg = t("ui.build_err_size");
                else if (catIdx === 1 && selected.basi.length === 0) msg = t("ui.build_err_basi");
                else if (catIdx === 2 && selected.proteine.length === 0 && warnedStep === catIdx) msg = t("ui.build_warn_proteine");
                else if (catIdx === 3 && selected.verdure.length < 4 && warnedStep === catIdx) msg = t("ui.build_warn_verdure");

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
                      {catIdx === 0 ? `${t("builder.basi_label")} →` : `${MENU_CATEGORIES[catOrder[catIdx + 1]].label} →`}
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
              {t("ui.build_summary_btn")}
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
        }}>{t("ui.cart_title")}</div>
        <span style={{
          marginLeft: "auto",
          background: theme.accent, color: "#fff",
          fontSize: 12, fontWeight: 700,
          padding: "3px 10px", borderRadius: 12,
        }}>{totalItems}</span>
      </div>

      <div style={{ padding: 16 }}>
        {cart.some(i => i.type === "custom") ? (
          <div style={{
            fontFamily: "'Jaapokki', sans-serif",
            fontSize: 22, fontWeight: 900, color: theme.text,
            letterSpacing: 1, marginBottom: 16,
          }}>
            {customerName.trim()}
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <input
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder={t("ui.cart_name_placeholder")}
              autoComplete="given-name"
              style={{
                width: "100%", padding: "13px 14px",
                borderRadius: 12, fontSize: 15, fontFamily: "inherit",
                border: `2px solid ${customerName.trim() ? theme.accent : "#ef4444"}`,
                background: customerName.trim() ? theme.bg : "#fff5f5",
                color: theme.text, outline: "none",
                boxSizing: "border-box",
              }}
            />
            <div style={{ fontSize: 11, color: customerName.trim() ? theme.textSoft : "#ef4444", marginTop: 4, fontWeight: customerName.trim() ? 400 : 600 }}>
              {customerName.trim() ? t("ui.cart_name_appears") : t("ui.cart_name_required")}
            </div>
          </div>
        )}
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: theme.textSoft }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🥣</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>{t("ui.cart_empty_title")}</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>{t("ui.cart_empty_subtitle")}</div>
            <button onClick={() => setView("menu")} style={{
              marginTop: 20, padding: "12px 28px",
              background: theme.accent, border: "none", borderRadius: 12,
              color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>{t("ui.cart_empty_cta")}</button>
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

            {/* Aggiungi un'altra Scivedda */}
            <button onClick={() => { setActiveCategory("size"); setSelected({ size: null, basi: [], proteine: [], verdure: [], croccanti: [], salse: [], special: [] }); setPortions({}); setBowlName(""); setBowlNameEdited(false); setView("build"); }} style={{
              width: "100%", padding: "14px",
              background: theme.accentLight,
              border: `2px dashed ${theme.accent}`,
              borderRadius: 14, marginBottom: 12,
              color: theme.accent, fontSize: 14, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              🥣 {t("ui.cart_add_another")}
            </button>

            {/* Mangi qui / Porti via */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 8 }}>{t("ui.cart_where_eat")}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ id: "qui", label: t("ui.dine_in_label") }, { id: "via", label: t("ui.takeaway_label") }].map(opt => (
                  <button key={opt.id} onClick={() => setDiningOption(opt.id)} style={{
                    flex: 1, padding: "13px 8px",
                    background: diningOption === opt.id ? theme.accent : theme.card,
                    border: `2px solid ${diningOption === opt.id ? theme.accent : theme.border}`,
                    borderRadius: 12, cursor: "pointer",
                    fontSize: 14, fontWeight: 700,
                    color: diningOption === opt.id ? "#fff" : theme.text,
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}>{opt.label}</button>
                ))}
              </div>
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
                <span style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>{t("ui.cart_total")}</span>
                <span style={{
                  fontSize: 24, fontWeight: 800, color: theme.accent,
                  fontFamily: "'Jaapokki', sans-serif",
                }}>€{totalPrice.toFixed(2)}</span>
              </div>
              {(!customerName.trim() || !diningOption) && (
                <div style={{ textAlign: "center", marginBottom: 10, fontSize: 13, fontWeight: 700, color: "#ef4444" }}>
                  {!customerName.trim() ? t("ui.cart_insert_name_builder") : t("ui.cart_choose_dine")}
                </div>
              )}
              <button onClick={sendOrder} disabled={!customerName.trim() || !diningOption || sending} style={{
                width: "100%", padding: "16px",
                background: !customerName.trim() || !diningOption ? "#ccc" : "#25d366",
                border: "none", borderRadius: 14,
                color: "#fff", fontSize: 15, fontWeight: 700,
                cursor: !customerName.trim() || !diningOption ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: !customerName.trim() || !diningOption ? "none" : "0 4px 16px rgba(37,211,102,0.35)",
              }}>
                {sending ? t("ui.cart_sending") : `📲 ${t("ui.cart_send_whatsapp")}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ── Render: Summary ───────────────────────────────────────────────────

  // ── Render: Admin Login ───────────────────────────────────────────────
  const renderAdminLogin = () => (
    <div style={{ minHeight: "100vh", background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
          <div style={{ fontFamily: "'Jaapokki', sans-serif", fontSize: 22, color: theme.text, letterSpacing: 1 }}>{t("ui.admin_title")}</div>
        </div>
        <div style={{ background: theme.card, borderRadius: 18, padding: 24, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <input value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder={t("ui.admin_email_placeholder")} type="email"
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, fontSize: 14, fontFamily: "inherit", marginBottom: 12, outline: "none", boxSizing: "border-box", background: theme.bg }} />
          <input value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder={t("ui.admin_password_placeholder")} type="password"
            onKeyDown={e => e.key === "Enter" && adminLogin()}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, fontSize: 14, fontFamily: "inherit", marginBottom: 16, outline: "none", boxSizing: "border-box", background: theme.bg }} />
          {adminLoginError && <div style={{ color: "#e53e3e", fontSize: 13, marginBottom: 12 }}>{adminLoginError}</div>}
          <button onClick={adminLogin} disabled={adminLoading} style={{
            width: "100%", padding: "14px", background: theme.accent, border: "none", borderRadius: 12,
            color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>{adminLoading ? t("ui.admin_login_loading") : t("ui.admin_login_btn")}</button>
          <button onClick={() => setAdminView(false)} style={{ width: "100%", padding: "10px", background: "none", border: "none", color: theme.textSoft, fontSize: 13, cursor: "pointer", marginTop: 8 }}>
            {t("ui.admin_back_menu")}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Render: Admin Dashboard ───────────────────────────────────────────
  const renderAdmin = () => {
    const today = new Date().toDateString();
    const todayOrders = adminOrders.filter(o => new Date(o.created_at).toDateString() === today);

    const statusColors = { preparazione: "#3b82f6", pronto: "#10b981" };
    const statusLabels = { preparazione: t("ui.admin_in_prep"), pronto: t("ui.admin_ready") };
    const isConfirmed = (order) => order.whatsapp_confirmed === true;

    const todayActive = adminOrders.filter(o => new Date(o.created_at).toDateString() === today);
    const daFare = todayActive.filter(o => isConfirmed(o) && o.status !== "pronto").length;
    const inPrep = todayActive.filter(o => o.status === "preparazione").length;
    const pronti = todayActive.filter(o => o.status === "pronto").length;

    const todayStr = new Date().toDateString();
    const todayList = adminOrders.filter(o => new Date(o.created_at).toDateString() === todayStr);
    const yesterdayList = adminOrders.filter(o => new Date(o.created_at).toDateString() !== todayStr);

    const renderOrderCard = (order, isYesterday) => {
      const confirmed = isConfirmed(order);
      const orderDate = new Date(order.created_at);
      let borderColor = "#cbd5e1";
      if (!isYesterday) {
        if (order.status === "pronto") borderColor = statusColors.pronto;
        else if (order.status === "preparazione") borderColor = statusColors.preparazione;
        else if (confirmed) borderColor = "#22c55e";
        else borderColor = "#f59e0b";
      }
      return (
        <div key={order.id} style={{
          background: isYesterday ? "#f4f4f4" : order.status === "pronto" ? "#f0fdf4" : confirmed ? "#fff" : "#fffbeb",
          borderRadius: 16,
          boxShadow: isYesterday ? "none" : "0 4px 16px rgba(0,0,0,0.08)",
          border: `2px solid ${borderColor}`,
          opacity: isYesterday ? 0.65 : 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Card top */}
          <div style={{ padding: "16px 18px 10px", flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                {order.order_code && (
                  <div style={{ fontSize: 44, fontWeight: 900, color: isYesterday ? "#94a3b8" : theme.accent, letterSpacing: 2, lineHeight: 1 }}>{order.order_code}</div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: theme.text }}>{order.customer_name || t("ui.admin_anonymous")}</div>
                  {order.dining_option && (
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: order.dining_option === "qui" ? "#dbeafe" : "#fef9c3", color: order.dining_option === "qui" ? "#1d4ed8" : "#854d0e" }}>
                      {order.dining_option === "qui" ? `🍽 ${t("ui.admin_dine_in_badge")}` : `🛍 ${t("ui.admin_takeaway_badge")}`}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: theme.textSoft, marginTop: 1 }}>
                  {orderDate.toLocaleString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                  {isYesterday && ` · ${t("ui.admin_yesterday_tag")}`}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, fontSize: 20, color: isYesterday ? theme.textSoft : theme.accent }}>€{Number(order.total).toFixed(2)}</div>
                {confirmed && !isYesterday && (
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", background: "#dcfce7", borderRadius: 6, padding: "3px 8px", marginTop: 4 }}>✓ WA</div>
                )}
              </div>
            </div>
            {/* Items */}
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 8, marginTop: 4 }}>
              {order.order_items?.map((item, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 14, color: theme.text, fontWeight: 600 }}>
                    {item.qty}× {item.item_name}
                  </div>
                  {item.item_type === "custom" && item.details && resolveIngredients(item.details).map((line, j) => (
                    <div key={j} style={{ fontSize: 12, color: theme.textSoft, paddingLeft: 12, opacity: 0.85 }}>{line}</div>
                  ))}
                </div>
              ))}
              {order.customer_note && (
                <div style={{ marginTop: 8, fontSize: 13, color: "#7c3aed", background: "#f5f3ff", borderRadius: 8, padding: "6px 10px", fontWeight: 600 }}>
                  📝 {order.customer_note}
                </div>
              )}
            </div>
          </div>
          {/* Card actions */}
          {!isYesterday && (
            <div style={{ padding: "10px 14px 14px", borderTop: "1px solid #e8ecf0" }}>
              {!confirmed ? (
                <button onClick={() => confirmWhatsapp(order.id)} style={{
                  width: "100%", padding: "16px 0", borderRadius: 12, border: "none",
                  cursor: "pointer", fontSize: 16, fontWeight: 700,
                  background: "#25d366", color: "#fff", letterSpacing: 0.3,
                }}>✓ {t("ui.admin_confirm_wa")}</button>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    {/* Tasto Da Pagare / Pagato */}
                    <button onClick={async () => {
                      const next = !order.paid;
                      await supabase.from("orders").update({ paid: next }).eq("id", order.id);
                      setAdminOrders(prev => prev.map(o => o.id === order.id ? { ...o, paid: next } : o));
                    }} style={{
                      flex: 1, padding: "14px 4px", borderRadius: 10, border: "none", cursor: "pointer",
                      fontSize: 13, fontWeight: 700,
                      background: order.paid ? "#10b981" : "#ef4444",
                      color: "#fff",
                      boxShadow: `0 2px 8px ${order.paid ? "#10b98155" : "#ef444455"}`,
                      transition: "background 0.2s",
                    }}>{order.paid ? t("ui.admin_paid") : t("ui.admin_to_pay")}</button>
                    {/* Tasti In prep / Pronto */}
                    {["preparazione", "pronto"].map(s => (
                      <button key={s} onClick={() => updateOrderStatus(order.id, s)} style={{
                        flex: 1, padding: "14px 4px", borderRadius: 10, border: "none", cursor: "pointer",
                        fontSize: 13, fontWeight: 700,
                        background: order.status === s ? statusColors[s] : "#edf2f7",
                        color: order.status === s ? "#fff" : "#64748b",
                        boxShadow: order.status === s ? `0 2px 8px ${statusColors[s]}55` : "none",
                        transition: "background 0.2s",
                      }}>{statusLabels[s]}</button>
                    ))}
                  </div>
                  <button onClick={() => printOrder(order)} style={{
                    width: "100%", padding: "14px 0", borderRadius: 10, border: "none",
                    cursor: "pointer", fontSize: 14, fontWeight: 700,
                    background: "#e2e8f0", color: "#475569",
                  }}>🖨 {t("ui.admin_print")}</button>
                </>
              )}
            </div>
          )}
        </div>
      );
    };

    return (
      <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ background: theme.text, color: "#fff", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div style={{ fontFamily: "'Jaapokki', sans-serif", fontSize: 22, letterSpacing: 1 }}>{t("ui.admin_kitchen_title")}</div>
            {/* Stat pills */}
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ background: "#f59e0b", borderRadius: 10, padding: "6px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 26, fontWeight: 900, lineHeight: 1 }}>{daFare}</span>
                <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.9 }}>{t("ui.admin_stat_todo")}</span>
              </div>
              <div style={{ background: "#3b82f6", borderRadius: 10, padding: "6px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 26, fontWeight: 900, lineHeight: 1 }}>{inPrep}</span>
                <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.9 }}>{t("ui.admin_stat_prep")}</span>
              </div>
              <div style={{ background: "#10b981", borderRadius: 10, padding: "6px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 26, fontWeight: 900, lineHeight: 1 }}>{pronti}</span>
                <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.9 }}>{t("ui.admin_stat_ready")}</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "6px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 26, fontWeight: 900, lineHeight: 1 }}>{todayOrders.length}</span>
                <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>{t("ui.admin_stat_today")}</span>
              </div>
            </div>
          </div>
          {dbSaveError && (
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fca5a5", background: "rgba(239,68,68,0.15)", borderRadius: 8, padding: "6px 12px" }}>
              ⚠️ {t("ui.admin_db_error")}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <a href="https://scivedda-linea.vercel.app" target="_blank" rel="noreferrer" style={{ background: "#d4763c", color: "#fff", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center" }}>LINEA ↗</a>
            <button onClick={fetchOrders} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", padding: "10px 18px", borderRadius: 10, cursor: "pointer", fontSize: 18 }}>↻</button>
            <button onClick={adminLogout} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", padding: "10px 18px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>{t("ui.admin_logout")}</button>
          </div>
        </div>

        {/* Orders grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 24px" }}>
          {adminOrders.length === 0 && (
            <div style={{ textAlign: "center", padding: 80, color: theme.textSoft, fontSize: 18 }}>{t("ui.admin_no_orders")}</div>
          )}

          {/* Today */}
          {todayList.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
              marginBottom: yesterdayList.length > 0 ? 28 : 0,
            }}>
              {todayList.map(order => renderOrderCard(order, false))}
            </div>
          )}

          {/* Yesterday divider + grid */}
          {yesterdayList.length > 0 && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 16px" }}>
                <div style={{ flex: 1, height: 1, background: "#cbd5e1" }} />
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{t("ui.admin_yesterday_label")}</div>
                <div style={{ flex: 1, height: 1, background: "#cbd5e1" }} />
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 12,
              }}>
                {yesterdayList.map(order => renderOrderCard(order, true))}
              </div>
            </>
          )}
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
        }}>{t("ui.confirm_title")}</h2>
        <p style={{ color: theme.textSoft, fontSize: 14, lineHeight: 1.5, margin: "0 0 24px" }}>
          {t("ui.confirm_body")}
        </p>
        <button onClick={resetOrder} style={{
          padding: "14px 32px",
          background: theme.accent, border: "none", borderRadius: 12,
          color: "#fff", fontSize: 14, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit",
        }}>{t("ui.confirm_new_order")}</button>
      </div>
    </div>
  );

  // ── Main Render ─────────────────────────────────────────────────────────
  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      background: view === "menu" && !adminView && !orderSent ? "#6b8c6e" : theme.bg,
      color: theme.text,
      minHeight: "100vh",
      width: "100%",
      maxWidth: adminView ? "none" : 1024,
      margin: adminView ? 0 : "0 auto",
      position: "relative",
      overflowX: "hidden",
      boxShadow: adminView ? "none" : "0 0 60px rgba(0,0,0,0.08)",
    }}>

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
                  {photoModal.vegan && <span style={{ background: "#2e7d32", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 6 }}>🌱 Vegan</span>}
                  {!photoModal.vegan && photoModal.vegetarian && <span style={{ background: "#558b2f", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 6 }}>🌿 Veg</span>}
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: 14, color: theme.textSoft, lineHeight: 1.6, margin: "0 0 16px" }}>
                {photoModal.desc}
              </p>
              {photoModal.warning && (
                <p style={{ fontSize: 13, color: theme.textSoft, fontStyle: "italic", lineHeight: 1.5, margin: "-8px 0 16px" }}>
                  {photoModal.warning}
                </p>
              )}

              {/* Allergens */}
              {photoModal.allergens.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: theme.textSoft, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{t("ui.modal_allergens")}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {photoModal.allergens.map(a => (
                      <span key={a} style={{
                        background: theme.accentLight, color: theme.accent,
                        fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 600,
                      }}>{getAllergenLabel(a, t)}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Price + Add */}
              {photoModal.sizes ? (
                <div>
                  {photoModal.suggestion && (
                    <p style={{ fontSize: 13, color: theme.accent, fontWeight: 600, fontStyle: "italic", marginBottom: 12, lineHeight: 1.5 }}>
                      {photoModal.suggestion}
                    </p>
                  )}
                  <div style={{ fontSize: 11, fontWeight: 600, color: theme.textSoft, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>{t("ui.modal_choose_size")}</div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                    {Object.entries(photoModal.sizes).map(([sizeKey, sizePrice]) => (
                      <button key={sizeKey} onClick={() => setModalSize(sizeKey)} style={{
                        flex: 1, padding: "12px 8px", borderRadius: 12, cursor: "pointer",
                        border: `2px solid ${modalSize === sizeKey ? theme.accent : theme.border}`,
                        background: modalSize === sizeKey ? theme.accentLight : theme.card,
                        fontFamily: "inherit", transition: "all 0.15s",
                      }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: theme.text, textTransform: "uppercase" }}>
                          {photoModal.sizeLabels?.[sizeKey] ?? sizeKey.toUpperCase()}
                        </div>
                        <div style={{ fontFamily: "'Jaapokki', sans-serif", fontSize: 18, color: theme.accent, marginTop: 2 }}>
                          {sizeKey === Object.keys(photoModal.sizes)[0]
                            ? `€${sizePrice.toFixed(2)}`
                            : `+${parseFloat((sizePrice - Object.values(photoModal.sizes)[0]).toFixed(2))}€`}
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={!modalSize}
                    onClick={() => {
                      const sizeLabel = photoModal.sizeLabels?.[modalSize] ?? modalSize.toUpperCase();
                      addMenuItemToCart({ ...photoModal, price: photoModal.sizes[modalSize], name: `${photoModal.name} (${sizeLabel})` });
                      setPhotoModal(null);
                      setModalSize(null);
                    }}
                    style={{
                      width: "100%", padding: "14px",
                      background: modalSize ? theme.accent : "#ccc",
                      border: "none", borderRadius: 14,
                      color: "#fff", fontSize: 15, fontWeight: 700,
                      cursor: modalSize ? "pointer" : "not-allowed", fontFamily: "inherit",
                      boxShadow: modalSize ? "0 4px 14px rgba(212,118,60,0.3)" : "none",
                    }}>
                    {modalSize ? t("ui.modal_add_with_size", { size: modalSize.toUpperCase() }) : t("ui.modal_choose_size_btn")}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontFamily: "'Jaapokki', sans-serif", fontSize: 26, color: theme.accent, letterSpacing: 0.5 }}>
                    {photoModal.price ? `€${photoModal.price.toFixed(2)}` : t("ui.modal_ask_counter")}
                  </span>
                  {photoModal.price && (
                    <button onClick={() => { addMenuItemToCart(photoModal); setPhotoModal(null); }} style={{
                      flex: 1, maxWidth: 180, padding: "14px",
                      background: theme.accent, border: "none", borderRadius: 14,
                      color: "#fff", fontSize: 15, fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit",
                      boxShadow: "0 4px 14px rgba(212,118,60,0.3)",
                    }}>+ {t("ui.modal_add_btn")}</button>
                  )}
                </div>
              )}
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
                              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    background: "rgba(255,255,255,0.25)",
                    padding: "2px 8px", borderRadius: 8,
                    fontSize: 13, fontWeight: 800,
                  }}>{totalItems}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{t("ui.floating_cart_label")}</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 800 }}>€{totalPrice.toFixed(2)}</span>
              </button>
            </div>
          )}

          {/* Floating cart on build view */}
          {view === "build" && cart.length > 0 && (
            <button onClick={() => setView("cart")} style={{
              position: "fixed", bottom: 96, right: 20,
              width: 56, height: 56, borderRadius: "50%",
              background: theme.accent, border: "none",
              color: "#fff", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(212,118,60,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, zIndex: 100,
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
