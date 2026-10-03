/* lang.js: useLang hook and i18next init for SIH26097 PM-AJAY */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { useState, useEffect, useCallback } from 'react';
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
  const { t, i18n: i18nInstance } = useTranslation();

  const getActiveLangCode = useCallback(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const current = stored || i18nInstance.language || 'en';
    const code = current.split('-')[0];
    return SUPPORTED_LANGUAGES.some((l) => l.code === code) ? code : 'en';
  }, [i18nInstance]);

  const [lang, setLangState] = useState(getActiveLangCode);

  useEffect(() => {
    const syncLang = (lng) => {
      const targetLng = typeof lng === 'string' ? lng : i18nInstance.language;
      const code = (targetLng || getActiveLangCode()).split('-')[0];
      const validCode = SUPPORTED_LANGUAGES.some((l) => l.code === code) ? code : 'en';
      setLangState(validCode);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = validCode;
      }
    };

    syncLang(i18nInstance.language);

    i18nInstance.on('languageChanged', syncLang);
    return () => {
      i18nInstance.off('languageChanged', syncLang);
    };
  }, [i18nInstance, getActiveLangCode]);

  const setLang = useCallback(
    (code) => {
      if (!SUPPORTED_LANGUAGES.find((l) => l.code === code)) return;
      localStorage.setItem(STORAGE_KEY, code);
      setLangState(code);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = code;
      }
      i18nInstance.changeLanguage(code);
    },
    [i18nInstance]
  );

  return { lang, setLang, languages: SUPPORTED_LANGUAGES };
}

export default i18n;
