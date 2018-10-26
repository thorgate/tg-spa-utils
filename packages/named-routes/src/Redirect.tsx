import { LocationState } from 'history';
import React, { SFC } from 'react';
import { Omit, Redirect, RedirectProps } from 'react-router';

import { Kwargs, Query, resolvePath, resolvePattern } from './routes';


export interface NamedRedirectProps extends Omit<RedirectProps, 'from' | 'to'> {
    fromName?: string;
    toName: string;
    toKwargs?: Kwargs;
    toQuery?: Query;
    toState?: LocationState;
}


export const NamedRedirect: SFC<NamedRedirectProps> = ({ fromName, toName, toKwargs, toQuery, toState, ...props }) => (
    <Redirect
        {...props}
        from={fromName ? resolvePattern(fromName) : undefined}
        to={resolvePath(toName, toKwargs, toQuery, toState)}
    />
);
