import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';


type ExtendedStore<S, T> = S & {
    [P in keyof T]: T[P]
};

export const configureStore = (reducer: any) => {
    const sagaMiddleware = createSagaMiddleware({
        onError: () => null,
    });

    const store = createStore(reducer, applyMiddleware(sagaMiddleware));

    (store as any).sagaMiddleware = sagaMiddleware;

    return store as ExtendedStore<typeof store, {
        sagaMiddleware: SagaMiddleware;
    }>;
};
