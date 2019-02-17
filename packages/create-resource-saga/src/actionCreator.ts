import { Kwargs } from '@thorgate/spa-is';

import { validateResourceAction } from './actionCheck';
import { resourceAction } from './actionType';
import { ActionCreator, ResourceActionPayload, ResourcePayloadMetaAction, StringOrSymbol } from './types';


/**
 * Get the "resource type literal" of a given resource action-creator
 */
export function getResourceType<ResourceType extends StringOrSymbol, T extends StringOrSymbol>(
    creator: ActionCreator<ResourceType, T>
): ResourceType {
    // istanbul ignore next: safeguard against invalid parameters
    if ((creator as any) == null) {
        throw new Error('first argument is missing');
    }

    // istanbul ignore next: safeguard against invalid parameters
    if (typeof creator.getResourceType === 'undefined') {
        throw new Error('first argument is not an instance of "@thorgate/create-saga-resource" action');
    }

    return creator.getResourceType();
}

/**
 * Create specific resource action creator
 * @param resourceType - Resource type that will be used to limit actions passed to corresponding saga
 * @param actionType - Action type. Must be string or symbol
 * @param actionResolverHandler - Action creator helper
 */
export function createResourceAction<
    ResourceType extends StringOrSymbol,
    T extends StringOrSymbol,
    AC extends ActionCreator<ResourceType, T>
>(
    resourceType: ResourceType,
    actionType: T,
    actionResolverHandler: (
        resolve: <KW extends Kwargs<KW>, Data, Meta = undefined>(
            payload?: ResourceActionPayload<KW, Data>,
            meta?: Meta
        ) => ResourcePayloadMetaAction<ResourceType, T, KW, Data, Meta>
    ) => AC
): AC {
    validateResourceAction(resourceType, 1);
    validateResourceAction(actionType, 2);

    const actionCreator: AC = actionResolverHandler(
        resourceAction.bind(null, resourceType, actionType) as Parameters<typeof actionResolverHandler>[0]
    );

    return Object.assign(actionCreator, {
        getType: () => actionType,
        getResourceType: () => resourceType,
        // redux-actions compatibility
        toString: () => actionType,
    });
}
