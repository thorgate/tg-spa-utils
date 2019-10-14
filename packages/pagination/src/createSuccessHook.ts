import {
    FetchActionType,
    FetchMeta,
    GetKeyValue,
    Key,
    mergeKeyOptions,
    TypeConstant,
} from '@thorgate/spa-entities';
import { Kwargs } from '@thorgate/spa-is';
import {
    KwargsType,
    paginationActions,
} from '@thorgate/spa-pagination-reducer';
import { match } from 'react-router';
import { put, putResolve } from 'redux-saga/effects';

export interface Result<R = any> {
    result: R;
    next: KwargsType;
    previous: KwargsType;
}

export function createPaginationSuccessHook<Params extends Kwargs<Params> = {}>(
    key: Key,
    setNextOnly: boolean = false,
    enabled: boolean = true
) {
    function getKeyValue(matchObj: match<Params> | null, meta: FetchMeta) {
        return GetKeyValue(
            key,
            mergeKeyOptions(matchObj, meta && meta.keyOptions)
        );
    }

    function* paginationSuccessHook<
        R extends Result,
        KW extends Kwargs<KW>,
        A extends FetchActionType<TypeConstant, KW, R>
    >(result: R, matchObj: match<Params> | null, action: A) {
        const { meta = {} } = action;
        const name = getKeyValue(matchObj, meta);

        if (result && !Array.isArray(result) && enabled) {
            yield put(
                paginationActions.setNextKwargs(name, result.next || null)
            );

            if (!setNextOnly) {
                yield put(
                    paginationActions.setCurrentKwargs(
                        name,
                        action.payload.query
                    )
                );
                yield put(
                    paginationActions.setPrevKwargs(
                        name,
                        result.previous || null
                    )
                );
            }
        } else {
            yield putResolve(paginationActions.setNextKwargs(name));
            yield putResolve(paginationActions.setCurrentKwargs(name));
            yield putResolve(paginationActions.setPrevKwargs(name));
        }
    }
    return paginationSuccessHook;
}
