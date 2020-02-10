import { renderRoutes } from 'react-router-config';
import warning from 'warning';

import { NamedRouteConfig } from './routes';

export interface RenderChildrenProps {
    route?: NamedRouteConfig;
    routes?: NamedRouteConfig[];

    extraProps?: any;
}

export const RenderChildren = ({
    route,
    routes,
    extraProps,
}: RenderChildrenProps) => {
    warning(
        !route || !routes,
        'RenderChildren Requires one of [route, routes]'
    );

    if (routes && routes.length) {
        return renderRoutes(routes, extraProps);
    }

    if (route && route.routes) {
        return renderRoutes(route.routes, extraProps);
    }

    return null;
};
