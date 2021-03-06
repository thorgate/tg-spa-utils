import { LocationState } from 'history';
import React from 'react';
import { Redirect, RedirectProps } from 'react-router';

import { Kwargs, Query, resolvePath, resolvePattern } from './routes';

export interface NamedRedirectProps extends Omit<RedirectProps, 'from' | 'to'> {
    fromName?: string;
    toName: string;
    toKwargs?: Kwargs;
    toQuery?: Query;
    toState?: LocationState;

    resolvePathFn?: typeof resolvePath;
    resolvePatternFn?: typeof resolvePattern;
}

export const NamedRedirect = ({
    fromName,
    toName,
    toKwargs,
    toQuery,
    toState,
    resolvePathFn,
    resolvePatternFn,
    ...props
}: NamedRedirectProps) => (
    <Redirect
        {...props}
        from={
            fromName
                ? (resolvePatternFn || resolvePattern)(fromName)
                : undefined
        }
        to={(resolvePathFn || resolvePath)(toName, toKwargs, toQuery, toState)}
    />
);
