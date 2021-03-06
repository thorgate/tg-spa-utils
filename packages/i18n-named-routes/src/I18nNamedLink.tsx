import React from 'react';
import { NamedLink, NamedLinkProps } from 'tg-named-routes';

import { useI18nResolvePath } from './hooks';

export type I18nNamedLinkProps = Omit<NamedLinkProps, 'resolvePathFn'>;

export const I18nNamedLink = (props: I18nNamedLinkProps) => {
    const resolvePathFn = useI18nResolvePath();

    return <NamedLink resolvePathFn={resolvePathFn} {...props} />;
};
