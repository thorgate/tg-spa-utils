import { I18nNamedRedirect } from './I18nNamedRedirect';
import { I18nNamedLink } from './I18nNamedLink';
import {
    buildUrlCache,
    cleanPathName,
    storeLanguages,
    getUrlForLanguage,
} from './url-cache';

export * from 'tg-named-routes';

export * from './create-config';
export * from './default-language-redirect';
export * from './hooks';

export {
    buildUrlCache,
    cleanPathName,
    I18nNamedRedirect,
    I18nNamedLink,
    storeLanguages,
    getUrlForLanguage,
};

// Also make sure to overwrite these from tg-named-routes
export const NamedRedirect = I18nNamedRedirect;
export const NamedLink = I18nNamedLink;
