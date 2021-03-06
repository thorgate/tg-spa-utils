import React from 'react';
import { useLocation } from 'react-router';
import {
    createLanguageRoutes,
    getDefaultLanguageRedirect,
    RenderChildren,
    NamedRouteConfig,
    TranslatedNamedRouteConfig,
    storeLanguages,
    buildUrlCache,
} from '../src';

const PageNotFound = () => <span>not found</span>;
const View = () => {
    const loc = useLocation();

    return <span>a view {loc.pathname}</span>;
};

const SingleNotFoundRoute: TranslatedNamedRouteConfig = {
    path: '*',
    name: 'notFound',
    component: PageNotFound,
};

const NotFoundRoute: TranslatedNamedRouteConfig = {
    name: '404',
    path: '*',
    component: RenderChildren,

    routes: [SingleNotFoundRoute],
};

const createBlogRoutes = (
    PageNotFoundRoute: TranslatedNamedRouteConfig
): TranslatedNamedRouteConfig => ({
    path: {
        et: '/et/blogi',
        en: '/en/blog',
    },
    name: 'blog',
    component: RenderChildren,
    routes: [
        {
            path: {
                et: '/et/blogi/populaarsed',
                en: '/en/blog/popular',
            },
            exact: true,
            name: 'popular',
            component: View,
        },
        {
            path: {
                et: '/et/blogi/artikkel/:slug',
                en: '/en/blog/article/:slug',
            },
            exact: true,
            name: 'article',
            component: View,
        },
        PageNotFoundRoute,
    ],
});

const createLandingRoutes = (
    PageNotFoundRoute: TranslatedNamedRouteConfig
): TranslatedNamedRouteConfig => ({
    name: 'landing',
    component: RenderChildren,
    path: {
        en: '/en',
        et: '/et',
    },
    routes: [
        {
            path: {
                en: '/en/privacy',
                et: '/et/privaatsuspoliitika',
            },
            exact: true,
            name: 'privacyPolicy',
            component: View,
        },
        {
            path: {
                en: '/en/news',
                et: '/et/uudised',
            },
            exact: true,
            name: 'news',
            component: View,
        },
        {
            path: {
                en: '/en/news/:slug',
                et: '/et/uudis/:slug',
            },
            exact: true,
            name: 'newsArticle',
            component: View,
        },
        {
            path: {
                en: '/en',
                et: '/et',
            },
            exact: true,
            name: 'home',
            component: View,
        },
        PageNotFoundRoute,
    ],
});

const routeConfig: NamedRouteConfig[] = createLanguageRoutes(
    'en',
    ['en', 'et'],
    [
        {
            component: RenderChildren,
            routes: [
                createBlogRoutes(SingleNotFoundRoute),
                createLandingRoutes(SingleNotFoundRoute),
                getDefaultLanguageRedirect('landing:home', null),
                NotFoundRoute,
            ],
        },
    ]
);

storeLanguages(['en', 'et']);
buildUrlCache(routeConfig);

export const routes = routeConfig;
