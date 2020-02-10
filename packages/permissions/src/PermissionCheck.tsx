import { ErrorState, ErrorType, getError } from '@thorgate/spa-errors';
import { ConnectedNamedRedirect } from '@thorgate/spa-pending-data';
import React, {
    Component,
    ComponentClass,
    ComponentType,
    ReactNode,
} from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import {
    NamedRouteConfigComponentProps,
    stringifyLocation,
} from 'tg-named-routes';
import warning from 'warning';

import { DefaultPermissionDenied } from './DefaultPermissionDenied';
import { getUser, isAuthenticated, User, UserState } from './userReducer';

export const DefaultRedirectParam = 'next';

export type PermissionCheckFn<P = any> = (
    params: P & PermissionCheckInternalProps
) => boolean;

export interface PermissionCheckProps {
    redirectRouteName?: string;
    redirectParam?: string;
    permissionCheck: PermissionCheckFn;
    PermissionDeniedComponent?: ComponentType;
    hideWithoutPermissions?: boolean;
    children: ReactNode;
    permissionDeniedStatusCodes?: number[];
}

interface StateProps {
    user: User;
    isAuthenticated: boolean;
    error: ErrorType;
}

interface PermissionCheckInternalProps
    extends PermissionCheckProps,
        StateProps,
        NamedRouteConfigComponentProps {}

class PermissionCheckBase extends Component<PermissionCheckInternalProps> {
    public static defaultProps = {
        permissionDeniedStatusCodes: [401, 403],
        PermissionDeniedComponent: DefaultPermissionDenied,
        hideWithoutPermissions: false,
        redirectParam: DefaultRedirectParam,
        error: null,
    };

    constructor(props: PermissionCheckInternalProps) {
        super(props);

        if (
            !this.props.redirectRouteName &&
            !this.props.PermissionDeniedComponent
        ) {
            // eslint-disable-next-line no-console
            console.warn(
                'PermissionCheck: Either "redirectLogin" or "PermissionDeniedComponent" is required.'
            );
        }
    }

    public render() {
        const {
            children,
            redirectRouteName,
            PermissionDeniedComponent,
            hideWithoutPermissions,
            location,
        } = this.props;

        // Check view permissions
        const hasPermission = this.hasPermission();

        if (!hasPermission && redirectRouteName && !PermissionDeniedComponent) {
            const redirectParam =
                this.props.redirectParam || DefaultRedirectParam;
            return (
                <ConnectedNamedRedirect
                    push={false}
                    toName={redirectRouteName}
                    toQuery={{ [redirectParam]: stringifyLocation(location) }}
                    toState={{ permissionDenied: true }}
                />
            );
        }

        if (!hasPermission && PermissionDeniedComponent) {
            return <PermissionDeniedComponent />;
        }

        if (!hasPermission) {
            warning(
                !hideWithoutPermissions,
                'PermissionCheck misconfiguration'
            );
            return null;
        }

        return children;
    }

    protected hasPermission() {
        const {
            error,
            permissionCheck,
            permissionDeniedStatusCodes,
        } = this.props;

        if (error && error.statusCode && permissionDeniedStatusCodes) {
            if (permissionDeniedStatusCodes.includes(error.statusCode)) {
                return false;
            }
        }

        return permissionCheck(this.props);
    }
}

interface ReduxState extends ErrorState, UserState {}

const mapStateToProps = (state: ReduxState) => ({
    error: getError(state),
    isAuthenticated: isAuthenticated(state),
    user: getUser(state),
});

export const PermissionCheck: ComponentClass<PermissionCheckProps> = withRouter(
    connect(mapStateToProps)(PermissionCheckBase)
);
