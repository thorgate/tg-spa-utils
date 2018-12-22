import { ConfigureStore, configureStore } from '@thorgate/test-store';
import { combineReducers } from 'redux';

import { loadingActions, loadingReducer, LoadingState, waitForData } from '../src';


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

        setTimeout(() => {
            store.dispatch(loadingActions.finishLoadingResource('test'));
            store.dispatch(loadingActions.finishLoadingView());
        }, 100);
    });
});
