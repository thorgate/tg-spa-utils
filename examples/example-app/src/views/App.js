import { PendingDataManager } from '@thorgate/spa-pending-data';
import { ErrorBoundary } from '@thorgate/spa-errors';
import React from 'react';
import Helmet from 'react-helmet';
import { RenderChildren } from 'tg-named-routes';

import './App.css';
import { Header } from '../components/Header';
import { Menu } from '../components/Menu';


const App = ({ history, route }) => (
    <ErrorBoundary>
        <Helmet>
            <html lang="en" />
            <title>Welcome to Razzle</title>
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Helmet>
        <Header />
        <Menu />
        <PendingDataManager loadingBarStyle={{ background: '#00D8FF' }}>
            <RenderChildren routes={route.routes} />
        </PendingDataManager>
    </ErrorBoundary>
);

export default App;
