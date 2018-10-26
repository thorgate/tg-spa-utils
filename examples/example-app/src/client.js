import '@thorgate/spa-components/dist/message-panel.css';
import 'tg-loading-bar/dist/loading_bar.css';
import { ConnectedRouter } from 'connected-react-router';
import React from 'react';
import { hydrate } from 'react-dom';
import { Provider } from 'react-redux';
import { RenderChildren } from 'tg-named-routes';

import { configureStore } from './store';
import routes from './views';


const initialState = window.__initial_state__ || {};

const { store, history } = configureStore(initialState);


const render = appRoutes => hydrate(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <RenderChildren routes={appRoutes} />
        </ConnectedRouter>
    </Provider>,
    document.getElementById('root'),
);

render(routes);

if (module.hot) {
    module.hot.accept('./views', () => {
        render(require('./views').default);
    });
}
