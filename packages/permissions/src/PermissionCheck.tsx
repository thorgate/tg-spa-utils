import { ErrorState, ErrorType, getError } from '@thorgate/spa-errors';
import { ConnectedNamedRedirect } from '@thorgate/spa-pending-data';
import React, { Component, ComponentType, ReactNode } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { NamedRouteConfigComponentProps, stringifyLocation } from 'tg-named-routes';
import warning from 'warning';

import { DefaultPermissionDenied } from './DefaultPermissionDenied';
import { getUser, isAuthenticated, User, UserState } from './userReducer';


export type PermissionCheckFn<P = any> = (params: P & PermissionCheckProps) => boolean;

export interface PermissionCheckProps extends NamedRouteConfigComponentProps {
    user: User;
    isAuthenticated: boolean;
    error: ErrorType;
    redirectRouteName?: string;
    permissionCheck: PermissionCheckFn;
    PermissionDeniedComponent?: ComponentType;
    hideWithoutPermissions?: boolean;
    children: ReactNode;
}


class PermissionCheckBase extends Component<PermissionCheckProps> {
    public static defaultProps = {
        PermissionDeniedComponent: DefaultPermissionDenied,
        hideWithoutPermissions: false,
        error: null,
    };

    constructor(props: PermissionCheckProps) {
        super(props);

        if (!this.props.redirectRouteName && !this.props.PermissionDeniedComponent) {
            console.warn('PermissionCheck: Either "redirectLogin" or "PermissionDeniedComponent" is required.');
        }
    }

    public render() {
        const { children, redirectRouteName, PermissionDeniedComponent, hideWithoutPermissions, location } = this.props;

        // Check view permissions
        const hasPermission = this.hasPermission();

        if (!hasPermission && redirectRouteName && !PermissionDeniedComponent) {
            return (
                <ConnectedNamedRedirect
                    push={false}
                    toName={redirectRouteName}
                    toQuery={{ next: stringifyLocation(location) }}
                    toState={{ permissionDenied: true }}
                />
            );
        }

        if (!hasPermission && PermissionDeniedComponent) {
            return <PermissionDeniedComponent />;
        }

        if (!hasPermission) {
            warning(!hideWithoutPermissions, 'PermissionCheck misconfiguration');
            return null;
        }

        return children;
    }

    protected hasPermission() {
        const { error, permissionCheck } = this.props;

        if (error && error.statusCode === 403) {
            return false;
        }

        return permissionCheck(this.props);
    }
}

interface ReduxState extends ErrorState, UserState {
}


const mapStateToProps = (state: ReduxState) => ({
    error: getError(state),
    isAuthenticated: isAuthenticated(state),
    user: getUser(state),
});


export const PermissionCheck = withRouter(connect(mapStateToProps)(PermissionCheckBase));
