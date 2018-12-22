import { ConfigureStore, configureStore } from '@thorgate/test-store';
import 'jest-dom/extend-expect';
import * as React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import { cleanup, fireEvent, render } from 'react-testing-library';
import { combineReducers } from 'redux';

import { loadingActions, loadingReducer, LoadingState, PendingDataManager } from '../src';


const reducer = combineReducers({
    loading: loadingReducer,
});

let store: ConfigureStore<LoadingState>;

beforeEach(() => {
    store = configureStore(reducer);
});

afterEach(() => {
    cleanup();
});

const renderApp = () => (
    <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
            <PendingDataManager>
                <div>
                    <Link to="/">Root</Link>
                    <Link to="/users">Users</Link>
                </div>
                <Switch>
                    <Route
                        path="/"
                        exact={true}
                        children={({ match }) => (
                            <div data-testid="root">
                                {JSON.stringify(match)}
                            </div>
                        )}
                    />
                    <Route
                        path="/users"
                        exact={true}
                        children={({ match }) => (
                            <div data-testid="users">
                                {JSON.stringify(match)}
                            </div>
                        )}
                    />
                </Switch>
            </PendingDataManager>
        </MemoryRouter>
    </Provider>
);


describe('PendingDataManager works', () => {
    test('previous route is rendered', () => {
        store.dispatch(loadingActions.startLoadingView());

        const { queryAllByText, getByText, getByTestId } = render(renderApp());

        fireEvent.click(getByText('Users'));

        expect(getByTestId('root')).toBeInTheDocument();
        expect(queryAllByText('users')).toHaveLength(0);

        store.dispatch(loadingActions.finishLoadingView());

        expect(queryAllByText('root')).toHaveLength(0);
        expect(getByTestId('users')).toBeInTheDocument();
    });
});
