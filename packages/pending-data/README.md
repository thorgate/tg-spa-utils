# `@thorgate/spa-pending-data`

> Pending data manager used by [Thorgate project template SPA variant](https://gitlab.com/thorgate-public/django-project-template/tree/spa)

[view-manager](https://github.com/thorgate/tg-spa-utils/tree/master/packages/view-manager/README.md) package uses `@thorgate/spa-pending-data` to store current
loading status of the app in Redux state.

## Usage:

Some where in your app:
```js
import { isViewLoading, loadingActions } from '@thorgate/spa-pending-data';
import { getLocation } from 'connected-react-router';
import { select, take } from 'redux-saga/effects';

export function* waitLoadingDone() {
    const location = yield select(getLocation);
    const loadedView = yield select(getLoadedView);

    if (loadedView === location.key) {
        return;
    }

    yield take(loadingActions.setLoadedView.getType());
}
```


`PendingDataManager` is designed to show previous location until `loadingActions.setLoadedView` is set to currently active location in `react-router` context.
