import { ActionPayload, Kwargs } from '@thorgate/create-resource-saga';
import { createStandardAction } from 'typesafe-actions';

import { FetchAction, FetchMeta } from './types';


export const createFetchAction = <
    T extends string, KW extends Kwargs<KW> = {}, Data = any
>(type: T): FetchAction<T, KW, Data> => (
    createStandardAction(type).map(
        (payload: ActionPayload<KW, Data>, meta: FetchMeta = {}) => ({
            payload, meta,
        })
    )
);
