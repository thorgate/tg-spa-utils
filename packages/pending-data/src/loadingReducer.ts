import { createAction, createReducer } from '@reduxjs/toolkit';

export const loadingActions = {
    setLoadedView: createAction(
        '@@tg-spa-pending-data/FINISH_LOADING_VIEW',
        (key: string | undefined) => ({ payload: key })
    ),
    startLoadingResource: createAction(
        '@@tg-spa-pending-data/START_LOADING_DATA',
        (key: string) => ({ payload: key })
    ),
    finishLoadingResource: createAction(
        '@@tg-spa-pending-data/FINISH_LOADING_DATA',
        (key: string) => ({ payload: key })
    ),
} as const;

export type LoadingActions =
    | typeof loadingActions.setLoadedView
    | typeof loadingActions.startLoadingResource
    | typeof loadingActions.finishLoadingResource;

interface DataLoadingState {
    [key: string]: boolean;
}

export interface LoadingStateType {
    view: string | undefined;
    data: DataLoadingState;
}

export interface LoadingState {
    loading: LoadingStateType;
}

const initialState: LoadingStateType = {
    data: {},
    view: undefined,
};

export const loadingReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(loadingActions.setLoadedView, (state, action) => {
            state.view = action.payload;
        })
        .addCase(loadingActions.startLoadingResource, (state, action) => {
            state.data[action.payload] = true;
        })
        .addCase(loadingActions.finishLoadingResource, (state, action) => {
            if (state.data[action.payload]) {
                delete state.data[action.payload];
            }
        })
        .addDefaultCase((_0, _1) => {
            return undefined;
        });
});

export const getLoadedView = <T extends LoadingState>(state: T) =>
    state.loading.view;

export const isViewLoaded = <T extends LoadingState>(
    state: T,
    locationKey: string | undefined
) => state.loading.view === locationKey;

export const isDataLoading = <T extends LoadingState>(state: T, key: string) =>
    state.loading.data[key] || false;

export const isLoading = <T extends LoadingState>(state: T) =>
    Object.keys(state.loading.data).reduce(
        (current, key) => current || isDataLoading(state, key),
        false
    );
