# `tg-saga-manager`

[Redux-Saga](https://github.com/redux-saga/redux-saga) helper to hot-reload sagas. Also has support for retrying failed root sagas.


## Usage

```
import { SagaHotReloader } from 'tg-saga-manager';

import rootSaga from './sagas';

// Create store ...
const sagaHotReloader = new SagaHotReloader(store, sagaMiddleware);

if (module.hot) {
    module.hot.accept('./sagas', () => {
        sagaHotReloader.replaceRootSaga(require('./sagas').default);
        console.log('🔁  HMR Reloaded `./sagas` ...');
    });
}

```
