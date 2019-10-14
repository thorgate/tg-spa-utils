import { Kwargs } from '@thorgate/spa-is';

import {
    ResourceActionPayload,
    ResourcePayloadMetaAction,
    TypeConstant,
} from './types';

export function resourceAction<
    ResourceType extends TypeConstant,
    T extends TypeConstant,
    KW extends Kwargs<KW>,
    Data
>(
    resourceType: ResourceType,
    type: T,
    payload?: ResourceActionPayload<KW, Data>
): ResourcePayloadMetaAction<ResourceType, T, KW, Data>;

export function resourceAction<
    ResourceType extends TypeConstant,
    T extends TypeConstant,
    KW extends Kwargs<KW>,
    Data,
    Meta
>(
    resourceType: ResourceType,
    type: T,
    payload: ResourceActionPayload<KW, Data>,
    meta: Meta
): ResourcePayloadMetaAction<ResourceType, T, KW, Data>;

export function resourceAction<
    ResourceType extends TypeConstant,
    T extends TypeConstant,
    KW extends Kwargs<KW>,
    Data,
    Meta = undefined
>(
    resourceType: ResourceType,
    type: T,
    payload: ResourceActionPayload<KW, Data> = {},
    meta?: Meta
) {
    return { type, resourceType, payload, meta } as any;
}
