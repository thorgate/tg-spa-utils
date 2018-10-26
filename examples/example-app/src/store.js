import { isNode } from '@thorgate/spa-is';
import { routerMiddleware } from 'connected-react-router';
import { createBrowserHistory, createMemoryHistory } from 'history';
import { applyMiddleware, createStore, compose } from 'redux';
import createSagaMiddleware, { END } from 'redux-saga';
import { SagaHotReloader } from 'tg-saga-manager';

import rootReducer from './reducer';
import rootSaga from './sagas';


export function configureStore(initialState = {}, options = {}) {
    const sagaMiddleware = createSagaMiddleware({
        onError: () => null,
    });

    let history;
    if (isNode()) {
        history = createMemoryHistory({initialEntries: [options.location || '/']});
    } else {
        history = createBrowserHistory();
    }

    const store = createStore(
        rootReducer(history),
        initialState,
        compose(
            applyMiddleware(
                routerMiddleware(history),
                sagaMiddleware,
            ),
        ),
    );

    // Add support to stop all sagas
    store.close = () => store.dispatch(END);

    // Add runSaga to limit point of failures
    store.runSaga = (saga, ...args) => sagaMiddleware.run(saga, ...args);

    const sagaHotReloader = new SagaHotReloader(store, sagaMiddleware);

    if (!isNode()) {
        sagaHotReloader.startRootSaga(rootSaga);
    }

    if (module.hot && !isNode()) {
        module.hot.accept('./reducer', () => {
            const nextRootReducer = require('./reducer').default;
            store.replaceReducer(nextRootReducer(history));
        });

        module.hot.accept('./sagas', () => {
            sagaHotReloader.replaceRootSaga(require('./sagas').default);
            console.log('🔁  HMR Reloaded `./sagas` ...');
        });
    }

    return { history, store };
}
