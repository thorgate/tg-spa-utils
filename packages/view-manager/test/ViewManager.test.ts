import { getError } from '@thorgate/spa-errors';
import { ConfigureStore, configureStore } from '@thorgate/test-store';
import { routerMiddleware } from 'connected-react-router';
import { createMemoryHistory } from 'history';
import { END } from 'redux-saga';
import { buildUrlCache, resetUrlCache } from 'tg-named-routes';

import { createLocationAction, ServerViewManagerWorker, ViewManager } from '../src';
import { rootReducer, State } from './reducer';
import { routes, waitLoadingDone } from './TestRoutes';


let store: ConfigureStore<State>;

const history = createMemoryHistory({ initialEntries: ['/'] });

beforeEach(() => {
    store = configureStore(rootReducer(history), routerMiddleware(history));

    resetUrlCache();
    buildUrlCache(routes);
});

describe('ViewManager works', () => {
    test('as worker', async () => {
        const task = store.sagaMiddleware.run(ServerViewManagerWorker, routes, createLocationAction(store.getState().router));
        await task.toPromise();

        expect(store.getState().data.status).toEqual(2);
    });

    test('as manager', async () => {
        jest.setTimeout(10000);

        const task = store.sagaMiddleware.run(ViewManager, routes);

        store.dispatch(createLocationAction({
            action: 'PUSH',
            location: {
                key: 'home',
                pathname: '/home',
                search: '',
                hash: '',
                state: '',
            }
        }));

        await store.sagaMiddleware.run(waitLoadingDone).toPromise();
        expect(store.getState().data.status).toEqual(4);

        store.dispatch(createLocationAction({
            action: 'PUSH',
            location: {
                key: '.',
                pathname: '/',
                search: '',
                hash: '',
                state: '',
            }
        }));
        await store.sagaMiddleware.run(waitLoadingDone).toPromise();
        expect(store.getState().data.status).toEqual(2);

        store.dispatch(createLocationAction({
            action: 'PUSH',
            location: {
                key: 'root',
                pathname: '/root',
                search: '',
                hash: '',
                state: '',
            }
        }));
        await store.sagaMiddleware.run(waitLoadingDone).toPromise();
        expect(store.getState().data.status).toEqual(1);

        store.dispatch(createLocationAction({
            action: 'PUSH',
            location: {
                key: 'error',
                pathname: '/error',
                search: '',
                hash: '',
                state: '',
            }
        }));
        await store.sagaMiddleware.run(waitLoadingDone).toPromise();
        expect(store.getState().data.status).toEqual(500);
        const error = getError(store.getState());
        expect(error && error.message).toEqual('TEST Error');

        store.dispatch(END);
        await task.toPromise();
    });
});
