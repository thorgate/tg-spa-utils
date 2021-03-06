import { act, render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Router } from 'react-router';
import { I18nextProvider } from 'react-i18next';
import {
    getUrlNames,
    NamedRouteConfig,
    resolvePath,
    stringifyLocation,
    useI18nResolvePath,
    useI18nStringifyLocation,
    Kwargs,
    getUrlForLanguage,
    RenderChildren,
    useI18nResolvePattern,
    I18nNamedLink,
    I18nNamedRedirect,
} from '../src';

import { routes } from './routes';
import i18nInstance from './i18n-test';
import { createMemoryHistory } from 'history';

const getRouteKey = (
    routeData: NamedRouteConfig | NamedRouteConfig[],
    key: string
) => {
    const res: string[] = [];

    const items = Array.isArray(routeData) ? routeData : [routeData];

    items.forEach(route => {
        if (route[key]) {
            res.push(route[key]);
        }

        if (route.routes) {
            getRouteKey(route.routes, key).forEach(childPath => {
                res.push(childPath);
            });
        }
    });

    return res;
};

const getPaths = (routeData: NamedRouteConfig | NamedRouteConfig[]) =>
    getRouteKey(routeData, 'path');

const getNames = (routeData: NamedRouteConfig | NamedRouteConfig[]) =>
    getRouteKey(routeData, 'routeName');

const Component = ({ name, kwargs }: { name: string; kwargs?: Kwargs }) => {
    const resolve = useI18nResolvePath();
    const stringify = useI18nStringifyLocation();
    const pattern = useI18nResolvePattern();

    return (
        <>
            <div>{stringify(resolve(name, kwargs))}</div>
            <div>{pattern(name)}</div>
        </>
    );
};

Component.defaultProps = {
    kwargs: undefined,
};

afterEach(() => {
    // reset the language
    act(() => {
        i18nInstance.changeLanguage('en');
    });
});

describe('translated route config', () => {
    test('Translated config names are generated correctly', () => {
        expect(getNames(routes)).toEqual([
            'en:blog',
            'en:blog:popular',
            'en:blog:article',
            'en:blog:notFound',
            'et:blog',
            'et:blog:popular',
            'et:blog:article',
            'et:blog:notFound',
            'en:landing',
            'en:landing:privacyPolicy',
            'en:landing:news',
            'en:landing:newsArticle',
            'en:landing:home',
            'en:landing:notFound',
            'et:landing',
            'et:landing:privacyPolicy',
            'et:landing:news',
            'et:landing:newsArticle',
            'et:landing:home',
            'et:landing:notFound',
            'defaultLanguageRedirect',
            '404',
            '404:notFound',
        ]);
    });

    test('getUrlForLanguage works', () => {
        expect(getUrlForLanguage('/et/uudised', 'en')).toBe('/en/news');
        expect(getUrlForLanguage('/en/news', 'et')).toBe('/et/uudised');

        expect(getUrlForLanguage('/et/blogi', 'en')).toBe('/en/blog');
        expect(getUrlForLanguage('/en/blog', 'et')).toBe('/et/blogi');

        expect(getUrlForLanguage('/et/blogi/populaarsed', 'en')).toBe(
            '/en/blog/popular'
        );
        expect(getUrlForLanguage('/en/blog/popular', 'et')).toBe(
            '/et/blogi/populaarsed'
        );

        expect(getUrlForLanguage('/et', 'en')).toBe('/en');
        expect(getUrlForLanguage('/en', 'et')).toBe('/et');

        expect(getUrlForLanguage('/', 'et')).toBe('/');
        expect(getUrlForLanguage('/', 'en')).toBe('/');

        expect(getUrlForLanguage('/et/blogi/artikkel/asdasd', 'en')).toBe(
            '/en/blog/article/asdasd'
        );
        expect(getUrlForLanguage('/en/blog/article/asdasd', 'et')).toBe(
            '/et/blogi/artikkel/asdasd'
        );

        expect(getUrlForLanguage('/asdasdqe', 'en')).toBe(null);
    });

    test('Translated config paths are generated correctly', () => {
        expect(getPaths(routes)).toEqual([
            '/en/blog',
            '/en/blog/popular',
            '/en/blog/article/:slug',
            '*',
            '/et/blogi',
            '/et/blogi/populaarsed',
            '/et/blogi/artikkel/:slug',
            '*',
            '/en',
            '/en/privacy',
            '/en/news',
            '/en/news/:slug',
            '/en',
            '*',
            '/et',
            '/et/privaatsuspoliitika',
            '/et/uudised',
            '/et/uudis/:slug',
            '/et',
            '*',
            '/',
            '*',
            '*',
        ]);
    });

    test('getUrlNames', () => {
        expect(getUrlNames()).toEqual([
            '404',
            'en:blog',
            'en:blog:popular',
            'en:blog:article',
            'en:blog:notFound',
            'et:blog',
            'et:blog:popular',
            'et:blog:article',
            'et:blog:notFound',
            'en:landing',
            'en:landing:privacyPolicy',
            'en:landing:news',
            'en:landing:newsArticle',
            'en:landing:home',
            'en:landing:notFound',
            'et:landing',
            'et:landing:privacyPolicy',
            'et:landing:news',
            'et:landing:newsArticle',
            'et:landing:home',
            'et:landing:notFound',
            'defaultLanguageRedirect',
            '404:notFound',
        ]);
    });

    test('resolving works with standard method by prefixing language namespace', () => {
        expect(stringifyLocation(resolvePath('et:landing:news'))).toBe(
            '/et/uudised'
        );
        expect(stringifyLocation(resolvePath('en:landing:news'))).toBe(
            '/en/news'
        );
        expect(stringifyLocation(resolvePath('en:blog'))).toBe('/en/blog');
        expect(stringifyLocation(resolvePath('en:blog:popular'))).toBe(
            '/en/blog/popular'
        );
        expect(
            stringifyLocation(
                resolvePath('en:blog:article', { slug: 'a-slug' })
            )
        ).toBe('/en/blog/article/a-slug');
    });

    test('resolving works with hooks', async () => {
        const { getByText } = render(
            <I18nextProvider i18n={i18nInstance}>
                <Component
                    name="landing:newsArticle"
                    kwargs={{ slug: 'theSlug' }}
                />
            </I18nextProvider>
        );

        expect(getByText('/en/news/theSlug')).toBeInTheDocument();
        expect(getByText('/en/news/:slug')).toBeInTheDocument();

        await act(async () => {
            await i18nInstance.changeLanguage('et');
        });

        expect(getByText('/et/uudis/theSlug')).toBeInTheDocument();
        expect(getByText('/et/uudis/:slug')).toBeInTheDocument();
    });

    test('default language redirect', () => {
        const history = createMemoryHistory({
            initialEntries: ['/'],
        });

        render(
            <I18nextProvider i18n={i18nInstance}>
                <Router history={history}>
                    <RenderChildren routes={routes} />
                </Router>
            </I18nextProvider>
        );

        expect(history.location.pathname).toBe('/en');
    });

    test('NamedLink', async () => {
        const { getByText } = render(
            <I18nextProvider i18n={i18nInstance}>
                <MemoryRouter>
                    <I18nNamedLink
                        name="landing:newsArticle"
                        kwargs={{ slug: 'theSlug' }}
                    >
                        Link
                    </I18nNamedLink>
                </MemoryRouter>
            </I18nextProvider>
        );

        expect(getByText('Link')).toBeInTheDocument();
        expect(getByText('Link').closest('a')).toHaveAttribute(
            'href',
            '/en/news/theSlug'
        );

        await act(async () => {
            await i18nInstance.changeLanguage('et');
        });

        expect(getByText('Link').closest('a')).toHaveAttribute(
            'href',
            '/et/uudis/theSlug'
        );
    });

    test('NamedRedirect', async () => {
        const history = createMemoryHistory({
            initialEntries: ['/'],
        });

        render(
            <I18nextProvider i18n={i18nInstance}>
                <Router history={history}>
                    <I18nNamedRedirect
                        toName="landing:newsArticle"
                        toKwargs={{ slug: 'theSlug' }}
                    />
                </Router>
            </I18nextProvider>
        );

        expect(history.location.pathname).toBe('/en/news/theSlug');

        await act(async () => {
            await i18nInstance.changeLanguage('et');
        });

        expect(history.location.pathname).toBe('/et/uudis/theSlug');
    });
});
