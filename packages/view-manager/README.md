# `@thorgate/spa-view-manager`

> Redux-Saga runners used by  [Thorgate project template SPA variant](https://gitlab.com/thorgate-public/django-project-template/tree/spa)


## Basic Usage

```js
import { ViewManager, ServerViewManagerWorker, takeEveryWithMatch } from '@thorgate/spa-view-manager';

function* dataLoaderSaga(match: MatchWithRoute, action) {
    console.log('React router match', match);
    
    yield put({ type: 'TEST' });
}

function* watcherAction(match, action) {
    console.log('take helper with match', match, action);
}

function* watcher() {
    yield takeEveryWithMatch('TEST', '/', watcherAction);
}

// Example route config
const routes = [
    {
        path: '/',
        exact: true,
        component: () => null,
        initial: dataLoaderSaga,
    }, {
        name: 'path-name',
        path: '/path-name',
        exact: true,
        component: () => null,
        initial: asd,
    }
];


// Client root saga
function* rootSaga() {
    yield fork(ViewManager);
}

// Server side root saga
sagaMiddleware.run(ServerViewManagerWorker, routes, createLocationAction(store.getState().router));
```
