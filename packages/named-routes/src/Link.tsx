import React, { StatelessComponent } from 'react';
import { Omit } from 'react-router';
import { Link, LinkProps } from 'react-router-dom';

import { NamedComponentProps, resolvePath } from './routes';


export interface NamedLinkProps extends NamedComponentProps, Omit<LinkProps, 'to'> {}

export const NamedLink: StatelessComponent<NamedLinkProps> = ({ name, kwargs, query, state, ...props }) => (
    <Link {...props} to={resolvePath(name, kwargs, query, state)} />
);

NamedLink.defaultProps = {
    kwargs: {},
    query: null,
    state: null,
};
