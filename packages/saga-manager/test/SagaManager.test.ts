import { configureStore } from '@thorgate/test-store';
import { delay, put, take } from 'redux-saga/effects';

import { SagaHotReloader } from '../src';


function testReducer(state: any = null, action: any) {
    switch (action.type) {
        case 'REPLACE':
            return {
                hot: action.hot,
                name: action.name,
            };

        default:
            return state;
    }
}


let store: ReturnType<typeof configureStore>;
let hotReloader: SagaHotReloader;

beforeEach(() => {
    store = configureStore(testReducer);
    hotReloader = new SagaHotReloader(store, store.sagaMiddleware);
});


function* dummySaga(hot: boolean = false) {
    yield put({ type: 'REPLACE', hot, name: 'dummySaga' });

    // Wait forever
    while (true) {
        yield delay(10000);
    }
}

function* dummyReplacedSaga(hot: boolean = false) {
    yield put({ type: 'REPLACE', hot, name: 'dummyReplacedSaga :: Started' });

    try {
        // Wait forever
        while (true) {
            yield delay(10000);
        }
    } finally {
        yield put({ type: 'REPLACE', hot, name: 'dummyReplacedSaga :: Stopped' });
    }
}

function* dummySagaWithError(hot: boolean = false) {
    yield put({ type: 'REPLACE', hot, name: 'dummySagaWithError' });

    yield take('BEGIN');

    throw new Error('Test error');
}


describe('SagaHotReloader works', () => {
    test('No action if nothing is running', () => {
        hotReloader.stopRootSaga();
        expect(hotReloader.runningTask).toBeNull();
    });

    test('Replace requires running root', () => {
        hotReloader.replaceRootSaga(dummySaga);
        expect(hotReloader.runningTask).toBeNull();
    });

    test('start => stop works', async () => {
        hotReloader.startRootSaga(dummySaga);
        await hotReloader.stopRootSaga();
        expect(store.getState()).toEqual({ hot: false, name: 'dummySaga' });
    });

    test('start => replace => stop works', async () => {
        hotReloader.startRootSaga(dummySaga);
        expect(store.getState()).toEqual({ hot: false, name: 'dummySaga' });

        await hotReloader.replaceRootSaga(dummyReplacedSaga);
        expect(store.getState()).toEqual({ hot: true, name: 'dummyReplacedSaga :: Started' });

        await hotReloader.stopRootSaga();
        expect(store.getState()).toEqual({ hot: true, name: 'dummyReplacedSaga :: Stopped' });
    });

    test('start => stop works :: Production mode', async () => {
        process.env.NODE_ENV = 'production';

        const onError = jest.fn();

        hotReloader = new SagaHotReloader(store, store.sagaMiddleware, {
            maxRetries: 2,
            onError,
        });

        hotReloader.startRootSaga(dummySagaWithError);

        expect(store.getState()).toEqual({ hot: false, name: 'dummySagaWithError' });
        store.dispatch({ type: 'BEGIN' });

        expect(store.getState()).toEqual({ hot: true, name: 'dummySagaWithError' });
        store.dispatch({ type: 'BEGIN' });

        expect(onError.mock.calls.length).toEqual(2);

        await hotReloader.stopRootSaga();
    });
});
