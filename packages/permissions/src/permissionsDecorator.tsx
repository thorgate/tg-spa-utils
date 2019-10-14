import React, { ComponentType, FC } from 'react';

import {
    PermissionCheck,
    PermissionCheckFn,
    PermissionCheckProps,
} from './PermissionCheck';

export type CreateDecoratorOptions = Pick<
    PermissionCheckProps,
    | 'redirectRouteName'
    | 'PermissionDeniedComponent'
    | 'hideWithoutPermissions'
    | 'permissionDeniedStatusCodes'
    | 'redirectParam'
>;

/**
 * Check permissions for wrapped component.
 *
 * If `permissionCheckFn` returns false then user is returned to login screen or
 *  `PermissionDeniedComponent` is rendered.
 *
 * Default behaviour is to return user to login screen with `Insufficient permissions` alert message.
 *
 * @function
 * @param permissionCheckFn Permission check function
 * @param [displayName=permissionCheck] Decorator name
 * @param [options={}] `PermissionCheck` Component options
 * @returns HoC function to wrap component e.g permissionCheck(...)(Component)
 */
export const permissionCheck = (
    permissionCheckFn: PermissionCheckFn,
    displayName: string | null = null,
    options: CreateDecoratorOptions = {}
) =>
    function decorator<Props>(Component: ComponentType<Props>) {
        const WrappedComponent: FC<Props> = props => (
            <PermissionCheck
                permissionCheck={permissionCheckFn}
                redirectRouteName={options.redirectRouteName}
                PermissionDeniedComponent={options.PermissionDeniedComponent}
            >
                <Component {...props} />
            </PermissionCheck>
        );

        const baseName = displayName || 'permissionCheck';
        WrappedComponent.displayName = `${baseName}(${Component.displayName ||
            Component.name})`;
        return WrappedComponent;
    };

/**
 * Check if user is authenticated, if not then user is returned to login screen.
 *
 * @function
 * @param {React.Component|Function} Component to wrap
 * @returns {React.Component|Function} Wrapped component
 */
export const loginRequired = permissionCheck(
    ({ isAuthenticated }) => isAuthenticated,
    'loginRequired'
);
