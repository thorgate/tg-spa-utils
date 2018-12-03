import memoize from 'memoize-one';
import React, { CSSProperties, FC, Fragment, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Route, RouteComponentProps, withRouter } from 'react-router';
import { LoadingBar } from 'tg-loading-bar';

import { isLoading, LoadingState } from './loadingReducer';


export interface PendingDataManagerProps extends RouteComponentProps {
    isDataLoading: boolean;
    children: ReactNode;
    loadingBarStyle?: CSSProperties;
}

const showCurrentLocation = (currentProps: PendingDataManagerProps, prevProps: PendingDataManagerProps) => (
    currentProps.location.key !== prevProps.location.key && currentProps.isDataLoading
);

const getLocation = memoize((props: PendingDataManagerProps) => props.location, showCurrentLocation);


const PendingDataManagerBase: FC<PendingDataManagerProps> = (props: PendingDataManagerProps) => {
    const { location, children, isDataLoading } = props;
    const currentLocation = getLocation(props);

    return (
        <Fragment>
            <LoadingBar
                key="loading-bar"
                simulate={true}
                isLoading={currentLocation.key !== location.key || isDataLoading}
                style={props.loadingBarStyle}
            />
            <Route key="route" location={currentLocation} render={() => children} />
        </Fragment>
    );
};


const mapStateToProps = <T extends LoadingState>(state: T) => ({
    isDataLoading: isLoading(state),
});

export const PendingDataManager = withRouter(connect(mapStateToProps)(PendingDataManagerBase));
