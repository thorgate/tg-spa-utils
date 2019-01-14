import { ActionType, createAction, getType } from 'typesafe-actions';


export const loadingActions = {
    startLoadingView: createAction('@@tg-spa-pending-data/START_LOADING_VIEW'),
    finishLoadingView: createAction('@@tg-spa-pending-data/FINISH_LOADING_VIEW'),
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
    view: boolean;
    data: DataLoadingState;
}

export interface LoadingState {
    loading: LoadingStateType;
}

const initialState: LoadingStateType = {
    data: {},
    view: false,
};

export function loadingReducer(state: LoadingStateType = initialState, action: LoadingActions): LoadingStateType {
    switch (action.type) {
        case getType(loadingActions.startLoadingView):
            return {
                ...state,
                view: true,
            };

        case getType(loadingActions.finishLoadingView):
            return {
                ...state,
                view: false,
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


export const isViewLoading = <T extends LoadingState>(state: T) => (
    state.loading.view
);

export const isDataLoading = <T extends LoadingState>(state: T, key: string) => (
    state.loading.data[key] || false
);

export const isLoading = <T extends LoadingState>(state: T) => (
    Object.values(state.loading.data)
        .reduce((prev, current) => (
            prev || current
        ), state.loading.view)
);
