# `tg-named-routes`

React Router 4/5 named routes helper library to add support for named routes via [react-router-config](https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config).
Also provides named versions of [React-Router](https://github.com/ReactTraining/react-router/tree/master/packages/react-router) components.

## Usage

```
// routes.js
import {buildUrlCache} from 'tg-named-routes';

const routes = [
    {
        component: App,
        routes: [
            {
                path: '/',
                name: 'landing',
                render: props => null,
            }
        ],
    }
];
buildUrlCache(routes);

export default routes;

// client.js
import {RenderChildren} from 'tg-named-routes';
import routes from './routes';


hydrate(
    <BrowserRouter>
        <RenderChildren routes={routes} />
    </BrowserRouter>,
    document.getElementById('root'),
);

// App.js

const App = ({route}) => (
    <RenderChildren routes={route.routes} />
);

export default App;

// For more complex patterns use `react-router-config` directly:
// import { renderRoutes } from 'react-router-config';

const App = ({route}) => (
    {renderRoutes(route.routes)}
);

// And render you have an option to render links with names
import {Link} from 'tg-named-routes';

const FooBar = () => (
    <Fragment>
        <Link name="landing" />
    </Fragment>
);

```
