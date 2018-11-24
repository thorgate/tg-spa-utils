import { RouterState } from 'connected-react-router';
import { LocationState } from 'history';
import React, { SFC } from 'react';
import { connect } from 'react-redux';
import { Redirect, RedirectProps, RouteComponentProps, withRouter } from 'react-router';


interface ConnectedRedirectProps extends RedirectProps, RouteComponentProps {
    routerLocation: LocationState;
}


const ConnectedRedirectBase: SFC<ConnectedRedirectProps> = (props) => {
    const { location, routerLocation, ...rest } = props;
    if (location.key !== routerLocation.key) {
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
    routerLocation: state.router.location,
});

export const ConnectedRedirect: SFC<RedirectProps> = withRouter(
    connect(mapStateToProps)(ConnectedRedirectBase),
) as any;
