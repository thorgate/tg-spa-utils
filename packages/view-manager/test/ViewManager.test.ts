import { getError } from '@thorgate/spa-errors';
import { ConfigureStore, configureStore } from '@thorgate/test-store';
import { routerMiddleware } from 'connected-react-router';
import { createMemoryHistory } from 'history';
import { END } from 'redux-saga';
import { buildUrlCache, resetUrlCache } from 'tg-named-routes';

import { createLocationAction, ServerViewManagerWorker, ssrRedirectMiddleware, ViewManager } from '../src';
import { rootReducer, State } from './reducer';
import { routes, waitLoadingDone } from './TestRoutes';


describe('ViewManager works', () => {
    const createStore = (initialEntries: string[] = ['/']) => {
        const history = createMemoryHistory({ initialEntries });
        const store: ConfigureStore<State> = configureStore(rootReducer(history), ssrRedirectMiddleware(), routerMiddleware(history));

        resetUrlCache();
        buildUrlCache(routes);
        return store;
    };

    test('as worker', async () => {
        const store = createStore();
        const task = store.sagaMiddleware.run(ServerViewManagerWorker, routes, createLocationAction(store.getState().router));
        await task.toPromise();

        expect(store.getState().data.status).toEqual(2);
        store.dispatch(END);
    });

    test('as worker :: context', async () => {
        const store = createStore(['/redirect']);

        const task = store.sagaMiddleware.run(
            ServerViewManagerWorker, routes, createLocationAction(store.getState().router), { allowLogger: true },
        );
        const result = await task.toPromise();

        expect(result).toEqual({
            location: {
                hash: '',
                search: '',
                pathname: '/home',
            },
        });
        // Expecting view to redirect and not set status
        expect(store.getState().data.status).toBeUndefined();
        store.dispatch(END);
    });

    const testSkipInitials = async (skipInitialsForFirstRendering: boolean) => {
        const store = createStore(['/incrementing']);
        const serverLocationAction = createLocationAction(store.getState().router);
        // Mock initial location action that connected-react-router creates
        // See https://github.com/supasate/connected-react-router/blob/master/src/ConnectedRouter.js#L66
        const clientLocationAction = {
            type: serverLocationAction.type,
            payload: {
                ...serverLocationAction.payload,
                isFirstRendering: true,
            }
        };

        // First run ViewManager as worker (i.e. SSR)
        const serverTask = store.sagaMiddleware.run(ServerViewManagerWorker, routes, serverLocationAction);
        await serverTask.toPromise();

        // Check that data was loaded
        expect(store.getState().data.status).toEqual(1);

        // Secondly, run ViewManager as watcher (i.e. client-side)
        const task = store.sagaMiddleware.run(ViewManager, routes, { skipInitialsForFirstRendering });
        // Dispatch initial
        store.dispatch(clientLocationAction);
        await store.sagaMiddleware.run(waitLoadingDone).toPromise();
        store.dispatch(END);
        await task.toPromise();

        // Check if data has been loaded twice (if it was, status would be 2)
        const expectedStatus = skipInitialsForFirstRendering ? 1 : 2;
        expect(store.getState().data.status).toEqual(expectedStatus);
    };

    test('as worker with skipInitialsForFirstRendering', async () => {
        await testSkipInitials(true);
    });

    test('as worker without skipInitialsForFirstRendering', async () => {
        await testSkipInitials(false);
    });

    test('as manager', async () => {
        const store = createStore();
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
