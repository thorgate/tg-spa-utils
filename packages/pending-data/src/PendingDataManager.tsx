import { Location, locationsAreEqual } from 'history';
import React, { Component, CSSProperties, Fragment, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Route, RouteComponentProps, withRouter } from 'react-router';
import { LoadingBar } from 'tg-loading-bar';

import { isLoading, LoadingState } from './loadingReducer';


export interface PendingDataManagerProps extends RouteComponentProps {
    isDataLoading: boolean;
    children: ReactNode;
    isDisabled?: boolean;
    loadingBarStyle?: CSSProperties;
}

interface PendingDataManagerState {
    storedLocation: Location;
}

class PendingDataManagerBase extends Component<PendingDataManagerProps, PendingDataManagerState> {

    public state: PendingDataManagerState = {
        storedLocation: this.props.location,
    };

    public componentDidUpdate(prevProps: PendingDataManagerProps) {
        const notLoading = prevProps.isDataLoading && !this.props.isDataLoading;
        const locationChange = !locationsAreEqual(this.state.storedLocation, this.props.location) && !this.props.isDataLoading;

        if (notLoading || locationChange) {
            this.setState({ storedLocation: this.props.location });
        }
    }

    public render() {
        const { location, children, isDataLoading, isDisabled } = this.props;
        const { storedLocation } = this.state;

        const isViewPending = !locationsAreEqual(storedLocation, location) && !isDisabled;

        return (
            <Fragment>
                <LoadingBar
                    key="loading-bar"
                    simulate={true}
                    isLoading={isViewPending || isDataLoading}
                    style={this.props.loadingBarStyle}
                />
                <Route
                    key="route"
                    location={isDisabled ? location : storedLocation}
                    render={() => children}
                />
            </Fragment>
        );
    }
}

const mapStateToProps = <T extends LoadingState>(state: T) => ({
    isDataLoading: isLoading(state),
});

export const PendingDataManager = withRouter(connect(mapStateToProps)(PendingDataManagerBase));
