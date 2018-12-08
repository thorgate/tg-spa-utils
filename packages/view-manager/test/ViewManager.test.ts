import { put, take } from 'redux-saga/effects';
import { buildUrlCache, resetUrlCache } from 'tg-named-routes';

import { createLocationAction, ViewManagerWorker } from '../src';
import { configureStore, setResponse } from './createStore';


let store: ReturnType<typeof configureStore>;

function* dummyInitialLanding() {
    yield put(setResponse({ status: 1 }));
    console.log('initial landing');
}

function* dummyInitialHome() {
    yield put(setResponse({ status: 3 }));
    console.log('initial home');
}


function* dummyWatcher() {
    while (true) {
        const { response } = yield take('API_RESPONSE');
        console.log('watcher', response);
        yield put(setResponse({ status: response.status + 1 }));
    }
}


const routes = [
    {
        component: () => null,
        watcher: dummyWatcher,
        routes: [
            {
                name: 'landing',
                exact: true,
                path: '/',
                component: () => null,
                initial: dummyInitialLanding,
            },
            {
                name: 'home',
                exact: true,
                path: '/home',
                component: () => null,
                initial: dummyInitialHome,
            },
        ]
    },
    {
        name: 'root',
        exact: true,
        path: '/root',
        component: () => null,
        initial: dummyInitialLanding,
    },
];

beforeEach(() => {
    store = configureStore();

    resetUrlCache();
    buildUrlCache(routes);
});

describe('ViewManager works', () => {
    test('as worker', async () => {
        const task = store.runSaga(ViewManagerWorker, routes, createLocationAction(store.getState().router));
        await task.toPromise();

        expect(store.getState().data.status).toEqual(2);
    });
});
