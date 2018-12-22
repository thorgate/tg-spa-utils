import { isViewLoading, loadingActions } from '@thorgate/spa-pending-data';
import { delay, put, select, take, takeLatest } from 'redux-saga/effects';

import { matchProvider } from '../src';
import { setResponse, State } from './reducer';


export function* waitLoadingDone() {
    const isLoading = yield select<State, boolean>(isViewLoading);

    if (!isLoading) {
        return;
    }

    yield take(loadingActions.finishLoadingView);
}

function* dummyInitialLanding() {
    yield delay(20);
    yield put(setResponse({ status: 1 }));
}

function* dummyInitialHome() {
    yield delay(20);
    yield put(setResponse({ status: 3 }));
}

function* dummyWatcher() {
    while (true) {
        const action = yield take('API_RESPONSE');

        const { response } = action;
        yield put(setResponse({ status: response.status + 1 }));
    }
}

function* dummyError() {
    yield delay(100);
    yield put(setResponse({ status: 500 }));
    throw new Error('TEST Error');
}

function* dummyTestMatcher(match: any) {
    yield put({ type: 'TEST_CALL', status: Number(match.params.id) });
}

function* dummyMatchProviderCallback(match: any, action: any) {
    yield put(setResponse({ status: Number(match.params.id) + action.status }));
}

function* dummyActionWatcher() {
    yield takeLatest('TEST_CALL', matchProvider as any, '/test/:id', dummyMatchProviderCallback);
}


export const routes = [
    {
        name: 'root',
        exact: true,
        path: '/root',
        component: () => null,
        initial: dummyInitialLanding,
    },
    {
        name: 'error',
        exact: true,
        path: '/error',
        component: () => null,
        initial: dummyError,
    },
    {
        path: '/',
        component: () => null,
        watcher: [
            dummyWatcher,
            dummyActionWatcher,
        ],
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
            {
                name: 'test',
                exact: true,
                path: '/test/:id',
                component: () => null,
                initial: dummyTestMatcher,
            },
        ]
    },
];
