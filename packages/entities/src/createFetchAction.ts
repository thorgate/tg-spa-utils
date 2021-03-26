import { createAction } from '@reduxjs/toolkit';
import {
    ResourceActionPayload,
    ResourceActionCreator,
    TypeConstant,
} from '@thorgate/create-resource-saga';
import { Kwargs } from '@thorgate/spa-is';

import { FetchMeta } from './types';

export { TypeConstant } from '@thorgate/create-resource-saga';

/**
 * Action creator matching signature:
 *
 *   (payload, meta) => ({ type, payload, meta })
 *
 * @param type - Action type
 */
export const createFetchAction = <
    T extends TypeConstant,
    KW extends Kwargs<KW> = Record<string, string | undefined>,
    Data = any
>(
    type: T
): ResourceActionCreator<T, KW, Data, FetchMeta> =>
    createAction(
        type,
        (
            payload: ResourceActionPayload<KW, Data> = {},
            meta: FetchMeta = {}
        ) => ({ payload, meta })
    );
