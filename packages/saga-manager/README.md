# `tg-saga-manager`

[Redux-Saga](https://github.com/redux-saga/redux-saga) helper to hot-reload sagas.
Also has support for retrying failed root sagas.


## Usage

```
import { SagaHotReloader } from 'tg-saga-manager';

import rootSaga from './sagas';

// Create store ...
const sagaHotReloader = new SagaHotReloader(store, sagaMiddleware);

// Start root saga
// Root saga should accept 1 parameter determining if it was restarted or hot-reloaded
sagaHotReloader.startRootSaga(rootSaga);

if (module.hot) {
    module.hot.accept('./sagas', () => {
        sagaHotReloader.replaceRootSaga(require('./sagas').default);
        console.log('🔁  HMR Reloaded `./sagas` ...');
    });
}

```


## Options

- ``enableHotReload``: *(boolean)*: Optionally to enable hot-reloading always or disable always.
                                    Defaults: ``process.env.NODE_ENV !== 'production'``
- ``maxRetries``: *(number)*: Optional max retries count. Default: ``10``
- ``onError``: *(Function)*: Optional Error handler with signature ``(error: any) => void``
