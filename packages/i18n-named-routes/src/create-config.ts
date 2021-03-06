import { NamedRouteConfig } from 'tg-named-routes';

export interface TranslatedNamedRouteConfig
    extends Omit<NamedRouteConfig, 'path' | 'routes'> {
    path?:
        | {
              [language: string]: string;
          }
        // note: string should only be used for notfound or default language redirect routes
        | '*'
        | '/';
    routes?: TranslatedNamedRouteConfig[];
}

export const createLanguageRoutes = (
    defaultLanguage: string,
    languages: string[],
    routes: TranslatedNamedRouteConfig[]
): NamedRouteConfig[] => {
    const res: NamedRouteConfig[] = [];

    routes.forEach(route => {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const children = createLanguageRoute(defaultLanguage, languages, route);

        children.forEach(item => res.push(item));
    });

    return res;
};

const createLanguageRoute = (
    defaultLanguage: string,
    languages: string[],
    route: TranslatedNamedRouteConfig
): NamedRouteConfig[] => {
    const res: NamedRouteConfig[] = [];

    const getChildren = (lang: string | null) =>
        route.routes
            ? createLanguageRoutes(
                  defaultLanguage,
                  lang === null ? languages : languages.filter(x => x === lang),
                  route.routes
              )
            : undefined;

    const identifier = route.name || route;

    const getName = (language: string) => {
        if (route.name) {
            return `${language}:${route.name}`;
        }

        return undefined;
    };

    // Route has path, generate all different variants for it
    if (route.path && typeof route.path !== 'string') {
        const { path } = route;

        languages.forEach(language => {
            const thePath = path[language] || path[defaultLanguage];

            if (!thePath) {
                throw new Error(`Missing ${language} for route ${identifier}`);
            }

            if (!thePath.startsWith(`/${language}`)) {
                throw new Error(
                    `Route route ${identifier} path does not start with /${language}.`
                );
            }

            res.push({
                ...route,

                path: thePath,
                name: getName(language),
                routes: getChildren(language),
            });
        });
    } else if (
        route.name &&
        route.name !== 'defaultLanguageRedirect' &&
        route.path !== '*'
    ) {
        languages.forEach(language => {
            res.push({
                ...route,
                path: typeof route.path === 'string' ? route.path : undefined,
                name: getName(language),
                routes: getChildren(language),
            });
        });
    } else {
        res.push({
            ...route,
            path: typeof route.path === 'string' ? route.path : undefined,
            routes: getChildren(null),
        });
    }

    return res;
};
