import React from 'react';
import { Redirect } from 'react-router';
import { Kwargs } from 'tg-named-routes/lib/routes';

import { TranslatedNamedRouteConfig } from './create-config';
import { useI18nResolvePath } from './hooks';

export const getDefaultLanguageRedirect = (
    routeName: string,
    kwargs: Kwargs | null
): TranslatedNamedRouteConfig => {
    const Component = () => {
        const getPath = useI18nResolvePath();

        return <Redirect to={getPath(routeName, kwargs)} />;
    };

    return {
        path: '/',
        name: 'defaultLanguageRedirect',
        component: Component,
        exact: true,
    };
};
