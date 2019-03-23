import { locationsAreEqual } from 'history';
import React, { ComponentClass, CSSProperties, FC, Fragment, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Route, RouteComponentProps, withRouter } from 'react-router';
import { LoadingBar } from 'tg-loading-bar';

import { getLoadedView, isLoading, LoadingState } from './loadingReducer';
import { usePendingLocation } from './usePendingLocation';


export interface PendingDataManagerProps {
    children: ReactNode;
    disabled?: boolean;
    loadingBarStyle?: CSSProperties;
}


interface PendingDataManagerInternalProps extends PendingDataManagerProps, RouteComponentProps {
    loading: boolean;
    loadingKey: string | undefined;
}


const PendingDataManagerBase: FC<PendingDataManagerInternalProps> = (props) => {
    const { location, loadingKey, children, loading, disabled, loadingBarStyle } = props;

    const storedLocation = usePendingLocation(location, loadingKey, disabled);
    const isViewPending = !locationsAreEqual(storedLocation, location) && !disabled;

    return (
        <Fragment>
            <LoadingBar
                key="loading-bar"
                simulate={true}
                isLoading={isViewPending || loading}
                style={loadingBarStyle}
            />
            <Route
                key="route"
                location={storedLocation}
                render={() => children}
            />
        </Fragment>
    );
};

const mapStateToProps = <T extends LoadingState>(state: T) => ({
    loadingKey: getLoadedView(state),
    loading: isLoading(state),
});

export const PendingDataManager: ComponentClass<PendingDataManagerProps> = withRouter(connect(mapStateToProps)(PendingDataManagerBase));
