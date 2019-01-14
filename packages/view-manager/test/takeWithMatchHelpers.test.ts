import { configureStore, ConfigureStore } from '@thorgate/test-store';
import { createMemoryHistory } from 'history';
import { END } from 'redux-saga';
import { buildUrlCache, resetUrlCache } from 'tg-named-routes';

import { createLocationAction, ViewManager } from '../src';
import { rootReducer, State } from './reducer';
import { routes, waitLoadingDone } from './TestRoutes';


let store: ConfigureStore<State>;

const history = createMemoryHistory({ initialEntries: ['/'] });

beforeEach(() => {
    store = configureStore(rootReducer(history));

    resetUrlCache();
    buildUrlCache(routes);
});


describe('takeEvery with match works', () => {
    test('with manager', async () => {
        const task = store.sagaMiddleware.run(ViewManager, routes);

        store.dispatch(createLocationAction({
            action: 'PUSH',
            location: {
                pathname: '/test-every/100',
                search: '',
                hash: '',
                state: '',
            }
        }));
        await store.sagaMiddleware.run(waitLoadingDone).toPromise();
        expect(store.getState().data.status).toEqual(211);

        store.dispatch(createLocationAction({
            action: 'PUSH',
            location: {
                pathname: '/test-every/0',
                search: '',
                hash: '',
                state: '',
            }
        }));
        await store.sagaMiddleware.run(waitLoadingDone).toPromise();
        expect(store.getState().data.status).toEqual(11);

        store.dispatch(END);
        await task.toPromise();
    });
});

describe('takeLatest with match works', () => {
    test('with manager', async () => {
        const task = store.sagaMiddleware.run(ViewManager, routes);

        store.dispatch(createLocationAction({
            action: 'PUSH',
            location: {
                pathname: '/test-latest/100',
                search: '',
                hash: '',
                state: '',
            }
        }));
        await store.sagaMiddleware.run(waitLoadingDone).toPromise();
        expect(store.getState().data.status).toEqual(301);

        store.dispatch(createLocationAction({
            action: 'PUSH',
            location: {
                pathname: '/test-latest/0',
                search: '',
                hash: '',
                state: '',
            }
        }));
        await store.sagaMiddleware.run(waitLoadingDone).toPromise();
        expect(store.getState().data.status).toEqual(101);

        store.dispatch(END);
        await task.toPromise();
    });
});

describe('takeLeading with match works', () => {
    test('with manager', async () => {
        const task = store.sagaMiddleware.run(ViewManager, routes);

        store.dispatch(createLocationAction({
            action: 'PUSH',
            location: {
                pathname: '/test-leading/100',
                search: '',
                hash: '',
                state: '',
            }
        }));
        await store.sagaMiddleware.run(waitLoadingDone).toPromise();
        expect(store.getState().data.status).toEqual(1201);

        store.dispatch(createLocationAction({
            action: 'PUSH',
            location: {
                pathname: '/test-leading/0',
                search: '',
                hash: '',
                state: '',
            }
        }));
        await store.sagaMiddleware.run(waitLoadingDone).toPromise();
        expect(store.getState().data.status).toEqual(1001);

        store.dispatch(END);
        await task.toPromise();
    });
});
