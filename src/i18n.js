import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    ns: ['translation'],
    defaultNS: 'translation',
    
    // --- THIS IS THE FIX ---
    // This tells i18next to treat "login.title" as a single key,
    // not as a nested object "login" with a key "title".
    keySeparator: false,
    // ------------------------

    react: {
      useSuspense: true,
    },
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export default i18n;