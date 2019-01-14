import memoize from 'memoize-one';
import React, { CSSProperties, FC, Fragment, ReactNode } from 'react';
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

type MemoizeArgs = [PendingDataManagerProps];

const showCurrentLocation = (newArgs: MemoizeArgs, lastArgs: MemoizeArgs) => (
    newArgs.length === 1 && newArgs.length === lastArgs.length && (
        newArgs[0].location.key !== lastArgs[0].location.key && newArgs[0].isDataLoading && !newArgs[0].isDisabled
    )
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
