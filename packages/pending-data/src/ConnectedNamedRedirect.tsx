import { isNode } from '@thorgate/spa-is';
import { getLocation, RouterState } from 'connected-react-router';
import { Location } from 'history';
import React, { ComponentClass } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { NamedRedirect, NamedRedirectProps } from 'tg-named-routes';

interface ConnectedRedirectProps
    extends NamedRedirectProps,
        RouteComponentProps {
    routerLocation: Location;
}

const ConnectedRedirectBase = (props: ConnectedRedirectProps) => {
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

export const ConnectedNamedRedirect: ComponentClass<NamedRedirectProps> = withRouter(
    connect(mapStateToProps)(ConnectedRedirectBase)
);
