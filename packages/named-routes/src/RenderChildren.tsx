import { StatelessComponent } from 'react';
import { renderRoutes } from 'react-router-config';
import warning from 'warning';

import { NamedRouteConfig } from './routes';


export interface RenderChildrenProps {
    route?: NamedRouteConfig;
    routes?: NamedRouteConfig[];
}

export const RenderChildren: StatelessComponent<RenderChildrenProps> = ({ route, routes }) => {
    warning(!route || !routes, 'RenderChildren Requires one of [route, routes]');

    if (routes && routes.length) {
        return renderRoutes(routes);
    }

    if (route && route.routes) {
        return renderRoutes(route.routes);
    }

    return null;
};
