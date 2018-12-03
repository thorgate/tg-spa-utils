import { errorReducer } from '@thorgate/spa-errors';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware, { Task } from 'redux-saga';

import { entitiesReducer } from '../src';


export const reducer = combineReducers({
    entities: entitiesReducer,
    error: errorReducer,
});

type ExtendedStore<S, T> = S & {
    [P in keyof T]: T[P]
};

type RunSaga = (saga: any, action: any) => Task;

export const configureStore = () => {
    const sagaMiddleware = createSagaMiddleware({
        onError: () => null,
    });

    const store = createStore(reducer, applyMiddleware(sagaMiddleware));

    function runSaga(saga: any, action: any): Task {
        return sagaMiddleware.run(saga, action);
    }

    (store as any).runSaga = runSaga;

    return store as ExtendedStore<typeof store, {
        runSaga: RunSaga;
    }>;
};
