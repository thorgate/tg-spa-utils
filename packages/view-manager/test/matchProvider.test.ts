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


describe('matchProvider works', () => {
    test('with manager', async () => {
        const task = store.sagaMiddleware.run(ViewManager, routes);

        store.dispatch(createLocationAction({
            action: 'PUSH',
            location: {
                pathname: '/test/100',
                search: '',
                hash: '',
                state: '',
            }
        }));
        await store.sagaMiddleware.run(waitLoadingDone).toPromise();
        expect(store.getState().data.status).toEqual(201);

        store.dispatch(createLocationAction({
            action: 'PUSH',
            location: {
                pathname: '/test/0',
                search: '',
                hash: '',
                state: '',
            }
        }));
        await store.sagaMiddleware.run(waitLoadingDone).toPromise();
        expect(store.getState().data.status).toEqual(1);

        store.dispatch(END);
        await task.toPromise();
    });
});
