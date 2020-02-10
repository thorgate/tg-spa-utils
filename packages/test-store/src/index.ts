import {
    Action,
    AnyAction,
    applyMiddleware,
    createStore,
    Middleware,
    Reducer,
    Store,
} from 'redux';
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';
import { select, takeEvery } from 'redux-saga/effects';

type ExtendedStore<S, T> = S &
    {
        [P in keyof T]: T[P];
    };

export type ConfigureStore<S = any, A extends Action = AnyAction> = Store<
    S,
    A
> & {
    sagaMiddleware: SagaMiddleware;
};

export const configureStore = <S = any, A extends Action = AnyAction>(
    reducer: Reducer<S, A>,
    ...middlewares: Array<Middleware<any, S, any>>
): ExtendedStore<
    Store<S, A>,
    {
        sagaMiddleware: SagaMiddleware;
    }
> => {
    const sagaMiddleware = createSagaMiddleware({
        onError: () => null,
    });

    const middlewareConfig = [...middlewares, sagaMiddleware];
    const store = createStore(reducer, applyMiddleware(...middlewareConfig));

    (store as any).sagaMiddleware = sagaMiddleware;

    return store as ExtendedStore<
        typeof store,
        {
            sagaMiddleware: SagaMiddleware;
        }
    >;
};

export function* watchAndLog(logAction = true, logState = true) {
    yield takeEvery('*', function* logger(action: any) {
        if (logAction) {
            // eslint-disable-next-line no-console
            console.log('action', action);
        }

        if (logState) {
            const state = yield select();
            // eslint-disable-next-line no-console
            console.log('state after', state);
        }
    });
}
