import React from 'react';
import { NamedRedirect, NamedRedirectProps } from 'tg-named-routes';

import { useI18nResolvePath, useI18nResolvePattern } from './hooks';

export type I18nNamedRedirectProps = Omit<
    NamedRedirectProps,
    'resolvePathFn' | 'resolvePattern'
>;

export const I18nNamedRedirect = (props: I18nNamedRedirectProps) => {
    const resolvePathFn = useI18nResolvePath();
    const resolvePatternFn = useI18nResolvePattern();

    return (
        <NamedRedirect
            resolvePathFn={resolvePathFn}
            resolvePatternFn={resolvePatternFn}
            {...props}
        />
    );
};
