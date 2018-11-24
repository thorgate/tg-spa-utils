import { RouterState } from 'connected-react-router';
import { LocationState } from 'history';
import React, { SFC } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { NamedRedirect, NamedRedirectProps } from 'tg-named-routes';


interface ConnectedRedirectProps extends NamedRedirectProps, RouteComponentProps {
    routerLocation: LocationState;
}


const ConnectedRedirectBase: SFC<ConnectedRedirectProps> = (props) => {
    const { location, routerLocation, ...rest } = props;
    if (location.key !== routerLocation.key) {
        return null;
    }

    return (
        <NamedRedirect {...rest} />
    );
};

ConnectedRedirectBase.displayName = `ConnectedNamedRedirect`;


interface ExpectedAppState {
    router: RouterState;
}

const mapStateToProps = (state: ExpectedAppState) => ({
    routerLocation: state.router.location,
});

export const ConnectedNamedRedirect: SFC<NamedRedirectProps> = withRouter(
    connect(mapStateToProps)(ConnectedRedirectBase),
) as any;
