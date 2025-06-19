import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize'; // For detecting the user's locale
import en from './en.json';
import ur from './ur.json';

const resources = {
  en: { translation: en },
  ur: { translation: ur },
};

i18n
  .use(initReactI18next) // Pass i18n instance to React-i18next
  .init({
    resources,
    lng: RNLocalize.getLocales()[0]?.languageCode || 'en', // Set the default language to user's locale or 'en'
    fallbackLng: 'en', // Fallback language if translation for a specific key is not found
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    react: {
      useSuspense: false, // To disable Suspense if needed (useful in older versions of React)
    },
  });

export default i18n;
