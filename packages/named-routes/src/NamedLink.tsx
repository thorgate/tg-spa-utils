import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

import { NamedComponentProps, resolvePath } from './routes';

export interface NamedLinkProps
    extends NamedComponentProps,
        Omit<LinkProps, 'to'> {
    resolvePathFn?: typeof resolvePath;
}

export const NamedLink = ({
    name,
    kwargs,
    query,
    state,
    resolvePathFn,
    ...props
}: NamedLinkProps) => (
    <Link
        {...props}
        to={(resolvePathFn || resolvePath)(name, kwargs, query, state)}
    />
);

NamedLink.defaultProps = {
    kwargs: {},
    query: null,
    state: null,
    resolvePathFn: resolvePath,
};
