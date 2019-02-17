import { createResourceAction, ResourceActionPayload } from '@thorgate/create-resource-saga';
import { Kwargs } from '@thorgate/spa-is';

import { EntitiesResource, FetchMeta } from './types';


/**
 * Action creator matching signature:
 *
 *   (payload, meta) => ({ type, resourceType, payload, meta })
 *
 * @param type - Action type
 */
export const createFetchAction = <
    T extends string, KW extends Kwargs<KW> = {}, Data = any
>(type: T) => (
    createResourceAction(EntitiesResource, type, (resolve) => (
        (payload: ResourceActionPayload<KW, Data> = {}, meta: FetchMeta = {}) => resolve(payload, meta)
    ))
);
