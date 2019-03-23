import { isNode } from '@thorgate/spa-is';
import { getLocation, RouterState } from 'connected-react-router';
import { LocationState } from 'history';
import React, { ComponentClass, FC } from 'react';
import { connect } from 'react-redux';
import { Redirect, RedirectProps, RouteComponentProps, withRouter } from 'react-router';


interface ConnectedRedirectProps extends RedirectProps, RouteComponentProps {
    routerLocation: LocationState;
}


const ConnectedRedirectBase: FC<ConnectedRedirectProps> = (props) => {
    const { location, routerLocation, ...rest } = props;
    if (location.key !== routerLocation.key && !isNode()) {
        return null;
    }

    return (
        <Redirect {...rest} />
    );
};
ConnectedRedirectBase.displayName = `ConnectedRedirect`;


interface ExpectedAppState {
    router: RouterState;
}

const mapStateToProps = (state: ExpectedAppState) => ({
    routerLocation: getLocation(state),
});

export const ConnectedRedirect: ComponentClass<RedirectProps> = withRouter(
    connect(mapStateToProps)(ConnectedRedirectBase),
);
