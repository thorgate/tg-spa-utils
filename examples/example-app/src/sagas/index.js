import { ViewManager } from '@thorgate/spa-view-manager';
import { fork, put, select } from 'redux-saga/effects';
import { replace } from 'connected-react-router';

import routes from '../views';


export default function* rootSaga(hot = false) {
    yield fork(ViewManager, routes);

    if (process.env.NODE_ENV !== 'production' && hot) {
        const location = yield select(state => state.router.location);
        yield put(replace(location));
    }
}
