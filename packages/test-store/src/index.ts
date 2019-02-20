import { Action, AnyAction, applyMiddleware, createStore, Reducer, Store } from 'redux';
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';


type ExtendedStore<S, T> = S & {
    [P in keyof T]: T[P]
};

export type ConfigureStore<S = any, A extends Action = AnyAction> = Store<S, A> & {
    sagaMiddleware: SagaMiddleware;
};

export const configureStore = <S = any, A extends Action = AnyAction>(reducer: Reducer<S, A>, routerMiddleware: any = null): Store<S, A> & {
    sagaMiddleware: SagaMiddleware;
} => {
    const sagaMiddleware = createSagaMiddleware({
        onError: () => null,
    });

    const middlewares = [];
    if (routerMiddleware) {
        middlewares.push(routerMiddleware);
    }

    middlewares.push(sagaMiddleware);

    const store = createStore(reducer, applyMiddleware(...middlewares));

    (store as any).sagaMiddleware = sagaMiddleware;

    return store as ExtendedStore<typeof store, {
        sagaMiddleware: SagaMiddleware;
    }>;
};
