import { FetchActionType, StringOrSymbol } from '@thorgate/spa-entities';
import { Kwargs } from '@thorgate/spa-is';
import { KwargsType, paginationActions } from '@thorgate/spa-pagination-reducer';
import { put, putResolve } from 'redux-saga/effects';


export interface Result<R = any> {
    result: R;
    next: KwargsType;
    previous: KwargsType;
}

export const createPaginationSuccessHook = (name: string, setNextOnly: boolean = false, enabled: boolean = true) => (
    function* paginationSuccessHook<
        R extends Result,
        KW extends Kwargs<KW>,
        A extends FetchActionType<StringOrSymbol, KW, R>
    >(result: R, _0: any, action: A) {
        if (result && !Array.isArray(result) && enabled) {
            yield put(paginationActions.setNextKwargs(name, result.next || null));

            if (!setNextOnly) {
                yield put(paginationActions.setCurrentKwargs(name, action.payload.query));
                yield put(paginationActions.setPrevKwargs(name, result.previous || null));
            }

        } else {
            yield putResolve(paginationActions.setNextKwargs(name));
            yield putResolve(paginationActions.setCurrentKwargs(name));
            yield putResolve(paginationActions.setPrevKwargs(name));
        }
    }
);
