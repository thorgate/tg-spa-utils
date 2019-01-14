import { ConfigureStore, configureStore } from '@thorgate/test-store';
import { combineReducers } from 'redux';

import { isDataLoading, isLoading, isViewLoading, loadingActions, loadingReducer, LoadingState, waitForData } from '../src';


const reducer = combineReducers({
    loading: loadingReducer,
});

let store: ConfigureStore<LoadingState>;

beforeEach(() => {
    store = configureStore(reducer);
});


describe('waitForData works', () => {
    test('waitForData resolves fast', async () => {
        await waitForData(store);
    });

    test('waitForData resolves after finish', (done) => {
        store.dispatch(loadingActions.startLoadingView());

        waitForData(store).then(() => {
            done();
        });

        store.dispatch(loadingActions.startLoadingResource('test'));
        store.dispatch(loadingActions.startLoadingResource('test2'));

        expect(isViewLoading(store.getState())).toEqual(true);
        expect(isDataLoading(store.getState(), 'test')).toEqual(true);
        expect(isDataLoading(store.getState(), 'test2')).toEqual(true);
        expect(isLoading(store.getState())).toEqual(true);

        setTimeout(() => {
            store.dispatch(loadingActions.finishLoadingResource('test'));
            store.dispatch(loadingActions.finishLoadingResource('test2'));
            store.dispatch(loadingActions.finishLoadingView());

            expect(isViewLoading(store.getState())).toEqual(false);
            expect(isDataLoading(store.getState(), 'test')).toEqual(false);
            expect(isDataLoading(store.getState(), 'test2')).toEqual(false);
        }, 100);
    });
});
