import { Location, LocationState } from 'history';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    resolvePath,
    resolvePattern,
    stringifyLocation,
    Kwargs,
    Query,
} from 'tg-named-routes';

const useI18nRoutes = (): {
    resolvePath: typeof resolvePath;
    resolvePattern: typeof resolvePattern;
    stringifyLocation: typeof stringifyLocation;
} => {
    const {
        i18n: { language },
    } = useTranslation();

    return useMemo(
        () => ({
            resolvePath: (
                name: string,
                kwargs?: Kwargs,
                query?: Query,
                state?: LocationState
            ): Location =>
                resolvePath(`${language}:${name}`, kwargs, query, state),
            resolvePattern: (name: string): string =>
                resolvePattern(`${language}:${name}`),
            stringifyLocation,
        }),
        [language]
    );
};

export const useI18nResolvePath = () => useI18nRoutes().resolvePath;
export const useI18nResolvePattern = () => useI18nRoutes().resolvePattern;
export const useI18nStringifyLocation = () => useI18nRoutes().stringifyLocation;
