import {
    buildUrlCache as baseBuildUrlCache,
    getUrlMapCache,
    resolvePath,
    stringifyLocation,
    NamedRouteConfig,
} from 'tg-named-routes';
import { matchPath } from 'react-router';

let allLanguages: string[] | null = null;

export const storeLanguages = (newLangs: string[]) => {
    allLanguages = newLangs.slice();
};

/**
 * Clean path name based on namespace and path
 *
 * For i18n routes this is required to prevent nested language routes from containing
 *  the language multiple times (e.g. we get `en:landing:home` instead of `en:landing:en:home`).
 *
 * @param separator Separator pattern for separating namespace and route name.
 * @param namespace Parent route name
 * @param pathName Route name
 * @return Generated route name
 */
export function cleanPathName(
    separator: string,
    namespace: string | null,
    pathName?: string | null
): string {
    if (!namespace && !pathName) {
        return '';
    }

    let routeName = pathName || '';

    if (!namespace) {
        return routeName;
    }

    // start extra logic for i18n
    if (namespace && routeName) {
        if (allLanguages) {
            for (let i = 0; i < allLanguages.length; i += 1) {
                const language = allLanguages[i];

                if (routeName.startsWith(`${language}${separator}`)) {
                    // This prevents
                    routeName = routeName.replace(
                        new RegExp(`^${language}${separator}`),
                        ''
                    );
                    break;
                }
            }
        }
    }
    // end extra logic for i18n

    routeName = `${namespace}${separator}${routeName}`;

    return routeName.replace(`${separator}${separator}`, `${separator}`);
}

let urlNameCache: Record<string, string> | null = null;

/**
 * Attempt to resolve the url in new language based on current path name
 *
 * @param currentPathName path name to get the language url for
 * @param newLanguage
 */
export function getUrlForLanguage(
    currentPathName: string,
    newLanguage: string
) {
    if (!urlNameCache) {
        throw new Error(
            'Missing available urls data, did you call `buildUrlCache`'
        );
    }

    // Easy case, no params involved
    if (urlNameCache[currentPathName]) {
        const newRouteName = urlNameCache[currentPathName].replace(
            /^[a-z]+:/,
            `${newLanguage}:`
        );

        return stringifyLocation(resolvePath(newRouteName));
    }

    // When params are involved we have to go trough all configured urls and figure out which
    //  one matches. This is because react-router params are only available in the subtree of
    //  that particular route (see https://github.com/ReactTraining/react-router/issues/5870).
    //  If params would be available everywhere this would be easier.

    const keys = Object.keys(urlNameCache);

    for (let i = 0; i < keys.length; i += 1) {
        // Ignore catchall routes (usually 404)
        if (keys[i] !== '*') {
            const match = matchPath(currentPathName, {
                path: keys[i],
                exact: true,
                strict: false,
            });

            if (match && Object.keys(match.params).length > 0) {
                const newRouteName = urlNameCache[keys[i]].replace(
                    /^[a-z]+:/,
                    `${newLanguage}:`
                );

                return stringifyLocation(
                    resolvePath(newRouteName, match.params)
                );
            }
        }
    }

    return null;
}

export function buildUrlCache(
    routeData: NamedRouteConfig[],
    separator = ':',
    namespace: string | null = null,
    routeNames: string[] = []
) {
    if (!allLanguages) {
        throw new Error(
            'Missing available languages data, did you call `storeLanguages`'
        );
    }

    baseBuildUrlCache(
        routeData,
        separator,
        namespace,
        routeNames,
        cleanPathName
    );

    const urlMapCache = getUrlMapCache();

    urlNameCache = {};
    if (urlNameCache) {
        Object.keys(urlMapCache).forEach((urlName: string) => {
            if (urlNameCache) {
                urlNameCache[urlMapCache[urlName].pattern] = urlName;
            }
        });
    }
}
