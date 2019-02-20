import { ActionType, createAction, getType } from 'typesafe-actions';


export const loadingActions = {
    setLoadedView: createAction(
        '@@tg-spa-pending-data/FINISH_LOADING_VIEW',
        (resolve) => (
            (key: string | undefined) => resolve(key)
        )
    ),
    startLoadingResource: createAction(
        '@@tg-spa-pending-data/START_LOADING_DATA',
        (resolve) => (
            (key: string) => resolve(key)
        ),
    ),
    finishLoadingResource: createAction(
        '@@tg-spa-pending-data/FINISH_LOADING_DATA',
        (resolve) => (
            (key: string) => resolve(key)
        ),
    ),
};

export type LoadingActions = ActionType<typeof loadingActions>;


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

export function loadingReducer(state: LoadingStateType = initialState, action: LoadingActions): LoadingStateType {
    switch (action.type) {
        case getType(loadingActions.setLoadedView):
            return {
                ...state,
                view: action.payload,
            };

        case getType(loadingActions.startLoadingResource):
            return {
                ...state,

                data: {
                    ...state.data,
                    [action.payload]: true,
                },
            };

        case getType(loadingActions.finishLoadingResource):
            return {
                ...state,

                data: Object.keys(state.data)
                    .filter((key: string) => action.payload !== key)
                    .reduce((prev: DataLoadingState, current: string) => {
                        prev[current] = state.data[current];
                        return prev;
                    }, {}),
            };

        default:
            return state;
    }
}


export const getLoadedView = <T extends LoadingState>(state: T) => (
    state.loading.view
);

export const isViewLoaded = <T extends LoadingState>(state: T, locationKey: string | undefined) => (
    state.loading.view === locationKey
);

export const isDataLoading = <T extends LoadingState>(state: T, key: string) => (
    state.loading.data[key] || false
);

export const isLoading = <T extends LoadingState>(state: T) => (
    Object.keys(state.loading.data).reduce((current, key) => (current || isDataLoading(state, key)), false)
);
