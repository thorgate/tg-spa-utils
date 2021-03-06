/* Client-side translation configuration */
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

const i18nInstance = i18next.createInstance();

i18nInstance
    .use(initReactI18next as any) // Need to define as any - type not accepted
    // tslint:disable-next-line:no-floating-promises
    .init({
        lng: 'en',
        load: 'languageOnly',
        fallbackLng: 'en',
        returnEmptyString: false,
        interpolation: {
            escapeValue: false, // Not needed for React
        },
        react: {
            useSuspense: false,
            nsMode: 'fallback',
        },
        initImmediate: false,
    });

export default i18nInstance;
