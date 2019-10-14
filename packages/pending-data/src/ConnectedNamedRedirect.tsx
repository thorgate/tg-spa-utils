import { isNode } from '@thorgate/spa-is';
import { getLocation, RouterState } from 'connected-react-router';
import { LocationState } from 'history';
import React, { ComponentClass, FC } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { NamedRedirect, NamedRedirectProps } from 'tg-named-routes';

interface ConnectedRedirectProps
    extends NamedRedirectProps,
        RouteComponentProps {
    routerLocation: LocationState;
}

const ConnectedRedirectBase: FC<ConnectedRedirectProps> = props => {
    const { location, routerLocation, ...rest } = props;
    if (location.key !== routerLocation.key && !isNode()) {
        return null;
    }

    return <NamedRedirect {...rest} />;
};

ConnectedRedirectBase.displayName = `ConnectedNamedRedirect`;

interface ExpectedAppState {
    router: RouterState;
}

const mapStateToProps = (state: ExpectedAppState) => ({
    routerLocation: getLocation(state),
});

export const ConnectedNamedRedirect: ComponentClass<
    NamedRedirectProps
> = withRouter(connect(mapStateToProps)(ConnectedRedirectBase));
