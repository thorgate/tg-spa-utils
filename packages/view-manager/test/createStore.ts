import { loadingReducer, LoadingStateType } from '@thorgate/spa-pending-data'
import { connectRouter, routerMiddleware, RouterState } from 'connected-react-router';
import { createMemoryHistory } from 'history';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware, { Task } from 'redux-saga';


export interface State {
    router: RouterState;
    loading: LoadingStateType;
    data: {
        [api: string]: any;
    };
}

interface Data {
    [api: string]: any;
}

const initialState: Data = {};


interface ApiResponseAction {
    type: 'API_RESPONSE';
    response: any;
}

export const setResponse = (response: any): ApiResponseAction => ({
    type: 'API_RESPONSE',
    response,
});

function reducer(state: Data = initialState, action: ApiResponseAction) {
    switch (action.type) {
        case 'API_RESPONSE':
            return action.response;

        default:
            return state;
    }
}

const rootReducer = (history: any) => combineReducers({
    router: connectRouter(history),
    loading: loadingReducer,
    data: reducer,
});

type ExtendedStore<S, T> = S & {
    [P in keyof T]: T[P]
};

type RunSaga = (saga: any, routes: any, action: any) => Task;

export const configureStore = () => {
    const sagaMiddleware = createSagaMiddleware({
        onError: () => null,
    });

    const history = createMemoryHistory({ initialEntries: ['/'] });
    const store = createStore(rootReducer(history), applyMiddleware(routerMiddleware(history), sagaMiddleware));

    function runSaga(saga: any, routes: any, action: any): Task {
        return sagaMiddleware.run(saga, routes, action);
    }

    (store as any).runSaga = runSaga;

    return store as ExtendedStore<typeof store, {
        runSaga: RunSaga;
    }>;
};
