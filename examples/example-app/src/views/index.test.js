import { ConnectedRouter } from 'connected-react-router';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { buildUrlCache, RenderChildren } from 'tg-named-routes';

import routes from '.';
import { configureStore } from '../store';


beforeEach(() => {
    buildUrlCache(routes);
});

describe('<App />', () => {
    test('renders without exploding', () => {
        const {store, history} = configureStore();

        const div = document.createElement('div');
        ReactDOM.render(
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <RenderChildren routes={routes} />
                </ConnectedRouter>
            </Provider>,
            div,
        );
    });
});
