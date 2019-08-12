import '@testing-library/jest-dom/extend-expect';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { ConfigureStore, configureStore } from '@thorgate/test-store';
import { ConnectedRouter, connectRouter, getLocation, push, RouterRootState } from 'connected-react-router';
import { createMemoryHistory, History } from 'history';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import { combineReducers } from 'redux';

import {
    isViewLoaded,
    loadingActions,
    loadingReducer,
    LoadingState,
    PendingDataManager
} from '../src';


interface State extends LoadingState, RouterRootState {
}

const reducer = (hist: History) => combineReducers({
    loading: loadingReducer,
    router: connectRouter(hist),
});

let history: History;
let store: ConfigureStore<State>;

beforeEach(() => {
    history = createMemoryHistory();
    store = configureStore(reducer(history));
});


const selectLocation = () => (
    getLocation(store.getState())
);


afterEach(cleanup);

const renderApp = () => (
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <PendingDataManager>
                <div>
                    <Link to="/">Root</Link>
                    <Link to="/users">Users</Link>
                    <Link to="/not-found">Not found</Link>
                </div>
                <Switch>
                    <Route
                        path="/"
                        exact={true}
                        children={() => (
                            <div data-testid="view">
                                I am root
                            </div>
                        )}
                    />
                    <Route
                        path="/users"
                        exact={true}
                        children={() => (
                            <div data-testid="view">
                                Hi users.
                            </div>
                        )}
                    />
                    <Route
                        children={({ location }) => (
                            <div data-testid="view">Did not find {location.pathname}</div>
                        )}
                    />
                </Switch>
            </PendingDataManager>
        </ConnectedRouter>
    </Provider>
);


describe('PendingDataManager', () => {
    test('Route pending works', () => {
        store.dispatch(loadingActions.setLoadedView(history.location.key));

        // View should be loaded right now
        expect(isViewLoaded(store.getState(), history.location.key)).toEqual(true);

        const { getByTestId, getByText } = render(renderApp());

        fireEvent.click(getByText('Users'));

        expect(isViewLoaded(store.getState(), history.location.key)).toEqual(false);
        expect(getByTestId('view')).toHaveTextContent('I am root');

        act(() => {
            store.dispatch(loadingActions.setLoadedView(history.location.key));
        });

        expect(isViewLoaded(store.getState(), history.location.key)).toEqual(true);
        expect(getByTestId('view')).toHaveTextContent('Hi users.');
    });

    test('fast resolve renders next route', () => {
        store.dispatch(loadingActions.setLoadedView(history.location.key));

        // View should be loaded right now
        expect(isViewLoaded(store.getState(), history.location.key)).toEqual(true);

        const { getByTestId, getByText } = render(renderApp());

        fireEvent.click(getByText('Users'));
        act(() => {
            store.dispatch(loadingActions.setLoadedView(history.location.key));
        });

        expect(isViewLoaded(store.getState(), history.location.key)).toEqual(true);
        expect(getByTestId('view')).toHaveTextContent('Hi users.');
    });

    test('Route blocking works :: dispatched', () => {
        store.dispatch(push('/'));
        store.dispatch(loadingActions.setLoadedView(selectLocation().key));

        // View should be loaded right now
        expect(isViewLoaded(store.getState(), selectLocation().key)).toEqual(true);

        const { getByText, getByTestId } = render(renderApp());

        fireEvent.click(getByText('Users'));

        expect(isViewLoaded(store.getState(), selectLocation().key)).toEqual(false);
        expect(getByTestId('view')).toHaveTextContent('I am root');

        act(() => {
            store.dispatch(loadingActions.setLoadedView(selectLocation().key));
        });

        // Mark loading as finished
        expect(isViewLoaded(store.getState(), selectLocation().key)).toEqual(true);
        expect(getByTestId('view')).toHaveTextContent('Hi users.');
    });

    test('Route blocking works :: not found', () => {
        store.dispatch(push('/'));
        store.dispatch(loadingActions.setLoadedView(selectLocation().key));

        // View should be loaded right now
        expect(isViewLoaded(store.getState(), selectLocation().key)).toEqual(true);

        const { getByText, getByTestId } = render(renderApp());

        fireEvent.click(getByText('Not found'));

        expect(isViewLoaded(store.getState(), selectLocation().key)).toEqual(false);
        expect(getByTestId('view')).toHaveTextContent('I am root');

        act(() => {
            store.dispatch(loadingActions.setLoadedView(selectLocation().key));
        });

        // Not found should be displayed
        expect(getByTestId('view')).toHaveTextContent('Did not find /not-found');
    });
});
