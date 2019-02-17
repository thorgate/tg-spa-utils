import { Location, LocationState } from 'history';
import pathToRegexp from 'path-to-regexp';
import * as qs from 'qs';
import { ComponentType } from 'react';
import { match } from 'react-router';
import { RouteConfig, RouteConfigComponentProps } from 'react-router-config';


export interface NamedRouteConfigComponentProps<
    Params extends { [K in keyof Params]?: string } = {}
> extends RouteConfigComponentProps<Params> {
    route?: NamedRouteConfig;
}

interface KwargsObject {
    [key: string]: any;
}

export type Kwargs = KwargsObject | null;

export type Query = null | string | object | any[];

export interface NamedComponentProps {
    name: string;
    kwargs?: Kwargs;
    query?: Query;
    state?: LocationState;
}

export interface NamedRouteConfig extends RouteConfig {
    routeName?: string;
    name?: string;
    component?: ComponentType<NamedRouteConfigComponentProps<any> | {}> | ComponentType<any>;
    routes?: NamedRouteConfig[];

    [key: string]: any;
}

export interface MatchedNamedRoute<Params extends { [K in keyof Params]?: string }> {
    route: NamedRouteConfig;
    match: match<Params>;
}

let urlMapCache: {
    [key: string]: {
        pattern: string;
        resolve: (kwargs: object) => string;
    };
} = {};


/**
 * Format path namespace and
 * @param separator Separator pattern for separating namespace and route name.
 * @param namespace Parent route name
 * @param pathName Route name
 * @return Generated route name
 */
export function cleanPathName(separator: string, namespace: string | null, pathName?: string | null): string {
    if (!namespace && !pathName) {
        return '';
    }

    let routeName = pathName || '';

    if (!namespace) {
        return routeName;
    }

    routeName = `${namespace}${separator}${routeName}`;

    return routeName.replace(`${separator}${separator}`, `${separator}`);
}

/**
 * Generate named path resolve and pattern cache.
 * Routes are built recursively.
 *
 * @param routeData List of routes to generate
 * @param [separator=':'] Separator for parent route name and child route name
 * @param [namespace=null] Parent route namespace
 * @param [routeNames=[]] For internal use only, used to keep track of generated URLs
 */
export function buildUrlCache(
    routeData: NamedRouteConfig[], separator: string = ':', namespace: string | null = null, routeNames: string[] = [],
) {
    routeData.forEach((route) => {
        route.routeName = cleanPathName(separator, namespace, route.name);

        // Prevent duplicate route names.
        if (routeNames.includes(route.routeName)) {
            throw Error(`Duplicated route name: ${route.routeName} Route: ${JSON.stringify(route)}`);
        }
        routeNames.push(route.routeName);

        if (route.path && route.name) {
            urlMapCache[route.routeName] = {
                pattern: route.path,
                resolve: pathToRegexp.compile(route.path),
            };
        }

        if (route.routes) {
            buildUrlCache(route.routes, separator, route.routeName, routeNames);
        }
    });
}

/**
 * Get list of url names.
 *
 * This is useful for debugging.
 */
export function getUrlNames(): string[] {
    return Object.keys(urlMapCache);
}

/**
 * Reset URL cache.
 *
 * Used only for testing.
 */
export function resetUrlCache() {
    urlMapCache = {};
}

/**
 * Resolve url name to valid path.
 *   Also known as `resolveUrl` or `reverseUrl`.
 *
 * Providing query string can be done with object or string.
 * Caveat with string is that it should be formatted correctly e.g `foo=bar` or `foobar`
 *
 * @param name URL name
 * @param [kwargs=null] URL parameters
 * @param [query=null] URL query string
 * @param [state=null] URL state object to pass to next url
 * @returns URL matching name and kwargs
 */
export function resolvePath(
    name: string, kwargs: Kwargs = null, query: Query = null, state: LocationState = null,
): Location {
    if (!Object.keys(urlMapCache).length) {
        throw new Error('Missing route data, did you call `buildUrlCache`');
    }

    if (!urlMapCache[name]) {
        throw Error(`Unknown url name : ${name}`);
    }

    const pathname = urlMapCache[name].resolve(kwargs || {});

    if (query) {
        let search = null;

        if (typeof query === 'object' || Array.isArray(query)) {
            search = qs.stringify(query);
        } else {
            search = query;
        }

        return {
            pathname,
            search,
            state,
            hash: '',
        };
    }

    return {
        pathname,
        search: '',
        state,
        hash: '',
    };
}


export function resolvePattern(name: string): string {
    if (!Object.keys(urlMapCache).length) {
        throw new Error('Missing route data, did you call `rebuildUrlCache`');
    }

    if (!urlMapCache[name]) {
        throw Error(`Unknown url name : ${name}`);
    }

    return urlMapCache[name].pattern;
}


export function stringifyLocation(location: Location): string {
    let path = location.pathname;

    if (location.search) {
        let query = location.search;

        if (!query.startsWith('?')) {
            query = `?${query}`;
        }

        path = `${path}${query}`;
    }

    return path;
}
