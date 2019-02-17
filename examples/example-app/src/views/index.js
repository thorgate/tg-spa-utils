import { buildUrlCache } from 'tg-named-routes';

import { simulateApiError, simulateLoading, simulateLogin, simulateLogout } from '../sagas/auth';
import simulateWatcher from '../sagas/simulateWatcher';

import App from './App';
import Home from './Home';
import HomeLoading from './HomeLoading';
import PageNotFound from './PageNotFound';
import RedirectHome from './RedirectHome';
import Restricted from './Restricted';
import RestrictedRedirect from './RestrictedRedirect';
import SimulatedError from './SimulateError';


const routes = [
    {
        component: App,
        watcher: simulateWatcher,
        routes: [{
            path: '/',
            exact: true,
            component: Home,
            name: 'home',
        }, {
            path: '/long',
            exact: true,
            component: HomeLoading,
            initial: simulateLoading,
            name: 'home-long',
        }, {
            path: '/home',
            exact: true,
            component: Restricted,
            name: 'restricted',
            initial: simulateApiError,
        }, {
            path: '/home-redirect',
            exact: true,
            component: RestrictedRedirect,
            name: 'restricted-redirect',
            initial: simulateApiError,
        }, {
            path: '/login',
            exact: true,
            component: RedirectHome,
            name: 'login',
            initial: simulateLogin,
        }, {
            path: '/logout',
            exact: true,
            component: RedirectHome,
            name: 'logout',
            initial: simulateLogout,
        }, {
            path: '/error',
            exact: true,
            component: SimulatedError,
            name: 'error-test',
        }, {
            path: '*',
            component: PageNotFound,
            name: '404',
        }],
    },
];

buildUrlCache(routes);

export default routes;
