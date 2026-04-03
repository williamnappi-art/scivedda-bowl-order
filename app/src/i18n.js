import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import it from "./locales/it.json";
import en from "./locales/en.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      it: { translation: it },
      en: { translation: en },
      de: { translation: de },
      fr: { translation: fr },
    },
    lng: "it",           // default language
    fallbackLng: "it",   // fall back to Italian if a key is missing
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
