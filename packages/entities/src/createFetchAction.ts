import { ActionPayload } from '@thorgate/create-resource-saga';
import { Kwargs } from '@thorgate/spa-is';
import { createAction } from 'typesafe-actions';

import { FetchAction, FetchMeta } from './types';


/**
 * Action creator matching signature:
 *
 *   (payload, meta) => ({ type, payload, meta })
 *
 * @param type - Action type
 */
export const createFetchAction = <
    T extends string, KW extends Kwargs<KW> = {}, Data = any
>(type: T): FetchAction<T, KW, Data> => (
    createAction(type, (resolve) => (
        (payload: ActionPayload<KW, Data> = {}, meta: FetchMeta = {}) => resolve(payload, meta)
    ))
);
