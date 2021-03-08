import { locationsAreEqual } from 'history';
import React, {
    ComponentClass,
    CSSProperties,
    Fragment,
    ReactNode,
} from 'react';
import { useSelector } from 'react-redux';
import { Route, RouteComponentProps, withRouter } from 'react-router';
import { LoadingBar } from 'tg-loading-bar';

import { getLoadedView, isLoading, LoadingState } from './loadingReducer';
import { usePendingLocation } from './usePendingLocation';

export interface PendingDataManagerProps {
    children: ReactNode;
    disabled?: boolean;
    loadingBarStyle?: CSSProperties;
}

interface PendingDataManagerInternalProps
    extends PendingDataManagerProps,
        RouteComponentProps {}

const selectLoadingState = (state: LoadingState) =>
    ({
        loadingKey: getLoadedView(state),
        loading: isLoading(state),
    } as const);

const PendingDataManagerBase = (props: PendingDataManagerInternalProps) => {
    const { location, children, disabled, loadingBarStyle } = props;

    const { loadingKey, loading } = useSelector(selectLoadingState);

    const storedLocation = usePendingLocation(location, loadingKey, disabled);
    const isViewPending =
        !locationsAreEqual(storedLocation, location) && !disabled;

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

export const PendingDataManager: ComponentClass<PendingDataManagerProps> = withRouter(
    PendingDataManagerBase
);
