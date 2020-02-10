import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { NamedLink, NamedRouteConfig, NamedRouteConfigComponentProps, RenderChildren } from '../src';


const AppShell = ({ route, match }: NamedRouteConfigComponentProps) => (
    <div className="app-shell">
        <div className="menu">
            <NamedLink name="home" data-testid="link-home">Link to Home</NamedLink>
            <NamedLink name="parent" data-testid="link-parent">Link to Parent</NamedLink>
            <NamedLink name="parent:child" kwargs={{ id: 1 }} data-testid="link-child">Link to Child</NamedLink>
        </div>
        <div>Path: {match.url}</div>
        <RenderChildren route={route} />
    </div>
);

const Home: React.FC<NamedRouteConfigComponentProps> = () => (
    <div className="home" data-testid="page-home">
        Home
    </div>
);

const ParentWithChildren = ({ route }: NamedRouteConfigComponentProps) => (
    <div className="parent-with-children">
        <div data-testid="page-parent">
            Parent page
        </div>
        <RenderChildren route={route} />
    </div>
);

const ChildWithParams = ({ match }: NamedRouteConfigComponentProps<{ id: string }>) => (
    <div className="child" data-testid="page-child">
        Child {match.params.id}
    </div>
);


export const routes: NamedRouteConfig[] = [
    {
        component: AppShell,
        routes: [
            {
                path: '/',
                exact: true,
                name: 'home',
                component: Home,
            },
            {
                path: '/parent',
                name: 'parent',
                component: ParentWithChildren,
                routes: [
                    {
                        path: '/parent/:id',
                        exact: true,
                        name: 'child',
                        component: ChildWithParams,
                    }
                ],
            },
        ],
    },
];


export const TestApp = ({ url }: { url: string }) => (
    <MemoryRouter initialEntries={[url]}>
        <RenderChildren routes={routes} />
    </MemoryRouter>
);
