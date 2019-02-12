# `@thorgate/spa-pending-data`

> Pending data manager used by [Thorgate project template SPA variant](https://gitlab.com/thorgate-public/django-project-template/tree/spa)

[view-manager](https://github.com/thorgate/tg-spa-utils/tree/master/packages/view-manager/README.md) package uses `@thorgate/spa-pending-data` to store current
loading status of the app in Redux state.

## Usage:

In your `Routes.js`:
```js
import { isViewLoading, loadingActions } from '@thorgate/spa-pending-data';
import { select, take } from 'redux-saga/effects';

export function* waitLoadingDone() {
    const isLoading = yield select(isViewLoading);

    if (!isLoading) {
        return;
    }

    yield take(loadingActions.finishLoadingView);
}
```
