import { errorActions } from '@thorgate/spa-errors';
import { isDevelopment, isNode, isRouteSagaObject, isSaga } from '@thorgate/spa-is';
import { call, put } from 'redux-saga/effects';

import { MatchedSagas } from './matchRouteSagas';

/**
 * Run sagas in sequence, if one of them fails, execution is stopped and result from that is thrown.
 *
 * @param sagas Array of sagas to run.
 */
export function* sagaRunner(sagas: MatchedSagas) {
    try {
        for (const sagaObj of sagas) {
            if (isSaga(sagaObj)) {
                yield call(sagaObj);
            } else if (isRouteSagaObject(sagaObj)) {
                const { saga, args = [] } = sagaObj;
                yield (call as any)(saga, ...args);
            }
        }
    } catch (error) {
        if ((!isNode() && isDevelopment()) || isNode()) {
            // It is more helpful to see real error message
            console.warn('SagaRunner failed with: %s', error);
        }
        yield put(errorActions.setError(error));
    }
}
