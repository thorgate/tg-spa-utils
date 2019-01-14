import { isViewLoading, loadingActions } from '@thorgate/spa-pending-data';
import { delay, put, select, take } from 'redux-saga/effects';

import { MatchWithRoute, takeEveryWithMatch, takeLatestWithMatch, takeLeadingWithMatch } from '../src';
import { setResponse } from './reducer';


export function* waitLoadingDone() {
    const isLoading = yield select(isViewLoading);

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

interface TestAction {
    type: 'TEST_CALL_EVERY' | 'TEST_CALL_LEADING' | 'TEST_CALL_LATEST';
    status: number;
}

interface TestParams {
    id: string;
}

function* dummyTestEveryInitial(match: MatchWithRoute<TestParams>) {
    yield put({ type: 'TEST_CALL_EVERY', status: Number(match.params.id) + 10 });
}

function* dummyTestLatestInitial(match: MatchWithRoute<TestParams>) {
    yield put({ type: 'TEST_CALL_LATEST', status: Number(match.params.id) + 100 });
}

function* dummyTestLeadingInitial(match: MatchWithRoute<TestParams>) {
    yield put({ type: 'TEST_CALL_LEADING', status: Number(match.params.id) + 1000 });
}

function* dummyMatchProviderCallback(match: MatchWithRoute<TestParams>, action: TestAction) {
    yield put(setResponse({ status: Number(match.params.id) + action.status }));
}

function* dummyActionWatcherEvery() {
    yield takeEveryWithMatch('TEST_CALL_EVERY', '/test-every/:id', dummyMatchProviderCallback);
}

function* dummyActionWatcherLatest() {
    yield takeLatestWithMatch('TEST_CALL_LATEST', '/test-latest/:id', dummyMatchProviderCallback);
}

function* dummyActionWatcherLeading() {
    yield takeLeadingWithMatch('TEST_CALL_LEADING', '/test-leading/:id', dummyMatchProviderCallback);
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
            dummyActionWatcherEvery,
            dummyActionWatcherLatest,
            dummyActionWatcherLeading,
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
                name: 'test-every',
                exact: true,
                path: '/test-every/:id',
                component: () => null,
                initial: dummyTestEveryInitial,
            },
            {
                name: 'test-latest',
                exact: true,
                path: '/test-latest/:id',
                component: () => null,
                initial: dummyTestLatestInitial,
            },
            {
                name: 'test-leading',
                exact: true,
                path: '/test-leading/:id',
                component: () => null,
                initial: dummyTestLeadingInitial,
            },
        ]
    },
];
