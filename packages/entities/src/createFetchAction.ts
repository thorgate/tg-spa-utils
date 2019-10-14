import {
    createResourceAction,
    ResourceActionPayload,
    TypeConstant,
} from '@thorgate/create-resource-saga';
import { Kwargs } from '@thorgate/spa-is';

import {
    EntitiesResource,
    FetchAction,
    FetchActionType,
    FetchMeta,
} from './types';

export type TypeConstant = TypeConstant;

/**
 * Check if `value` is entities action.
 * @param value
 */
export const isEntitiesAction = (
    value: any
): value is FetchActionType<TypeConstant> =>
    value && value.resourceType === EntitiesResource;

/**
 * Action creator matching signature:
 *
 *   (payload, meta) => ({ type, resourceType, payload, meta })
 *
 * @param type - Action type
 */
export const createFetchAction = <
    T extends TypeConstant,
    KW extends Kwargs<KW> = {},
    Data = any
>(
    type: T
): FetchAction<T, KW, Data> =>
    createResourceAction(
        EntitiesResource,
        type,
        resolve => (
            payload: ResourceActionPayload<KW, Data> = {},
            meta: FetchMeta = {}
        ) => resolve(payload, meta)
    );
