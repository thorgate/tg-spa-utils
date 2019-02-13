import { permissionCheck } from '@thorgate/spa-permissions';

export const loginRequiredRedirect = (decoratorProps = {}) => permissionCheck(
    ({ isAuthenticated }) => isAuthenticated, 'loginRequiredRedirect', {
        redirectRouteName: 'login',
        PermissionDeniedComponent: null,
        ...decoratorProps,
    },
);

export const loginRequired = (decoratorProps = {}) => permissionCheck(
    ({ isAuthenticated }) => isAuthenticated, 'loginRequired', {
        ...decoratorProps,
    },
);
