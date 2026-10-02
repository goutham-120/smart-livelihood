/* lang.js: useLang hook and i18next init for SIH26097 PM-AJAY */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import en from './i18n/en.js';
import hi from './i18n/hi.js';
import te from './i18n/te.js';

const STORAGE_KEY = 'pmajay_lang';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi',   native: 'हिंदी',   flag: '🇮🇳' },
  { code: 'te', label: 'Telugu',  native: 'తెలుగు',  flag: '🌿' },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en, hi, te },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

/* useLang: returns current language code and a setter that persists to localStorage */
export function useLang() {
  const { i18n: i18nInstance } = useTranslation();

  const lang = i18nInstance.language?.split('-')[0] || 'en';

  const setLang = useCallback(
    (code) => {
      if (!SUPPORTED_LANGUAGES.find((l) => l.code === code)) return;
      localStorage.setItem(STORAGE_KEY, code);
      i18nInstance.changeLanguage(code);
      /* Update the html lang attribute for correct font rendering */
      document.documentElement.lang = code;
    },
    [i18nInstance]
  );

  return { lang, setLang, languages: SUPPORTED_LANGUAGES };
}

export default i18n;
