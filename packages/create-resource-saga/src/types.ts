import { SagaResource } from '@tg-resources/redux-saga-router';
import { Kwargs } from '@thorgate/spa-is';
import { match } from 'react-router';
import { SagaIterator } from 'redux-saga';
import { Attachments, Query, Resource, ResourceMethods } from 'tg-resources';

/**
 * Resource action payload
 */
export interface ResourceActionPayload<KW extends Kwargs<KW>, Data> {
    kwargs?: KW | null;
    query?: Query | null;
    data?: Data | null;
    attachments?: Attachments | null;
    method?: ResourceMethods;
}

/**
 * Base meta options supported by
 */
export interface MetaOptions {
    [key: string]: any;
}

export type TypeConstant = string;

export interface ActionCreator<
    ResourceType extends TypeConstant,
    T extends TypeConstant
> {
    (...args: any[]): { type: T; resourceType: ResourceType };

    getType?: () => T;
    getResourceType?: () => ResourceType;
}

// Based on `typesafe-actions` payload meta actions
// Resource version adds restriction based on resourceType instead of type
// This is to support more swappable actions and limit action to specific IO type instead of action type
export type ResourcePayloadMetaAction<
    ResourceType extends TypeConstant,
    T extends TypeConstant,
    KW extends Kwargs<KW>,
    Data,
    Meta = undefined
> = Meta extends undefined
    ? {
          type: T;
          payload: ResourceActionPayload<KW, Data>;
          resourceType: ResourceType;
      }
    : {
          type: T;
          payload: ResourceActionPayload<KW, Data>;
          meta: Meta;
          resourceType: ResourceType;
      };

export interface ResourceSagaConfig {
    /**
     * Error message thrown when timeout occurs
     */
    timeoutMessage: string;

    /**
     * Request timeout in milliseconds
     *  Default: 3000
     */
    timeoutMs: number;
}

export interface ResourceSagaOptions<
    ResourceType extends TypeConstant,
    Klass extends Resource,
    KW extends Kwargs<KW>,
    Params extends Kwargs<Params>,
    Data = any,
    Meta = undefined
> extends Partial<ResourceSagaConfig> {
    /**
     * tg-resources instance used for handling request
     *  This is preferred usage. For advanced options use `apiHook`
     */
    resource?: Klass | SagaResource<Klass>;

    /**
     * tg-resources method used for handling request
     *  Default: fetch
     */
    method?: ResourceMethods;

    /**
     * Api hook used for fetching. `mutateKwargs` and `mutateQuery` is not used when this option is used.
     * **Notice**: only works when `resource` options is not provided.
     *
     * @param matchObj - React-router match
     * @param action - Resource action
     */
    apiHook?: (
        matchObj: match<Params> | null,
        action: ResourcePayloadMetaAction<
            ResourceType,
            TypeConstant,
            KW,
            Data,
            Meta
        >
    ) => any | SagaIterator;

    /**
     * Success handler called when requests succeeds
     *
     * @param result
     * @param matchObj
     * @param action
     */
    successHook?: (
        result: any,
        matchObj: match<Params> | null,
        action: ResourcePayloadMetaAction<
            ResourceType,
            TypeConstant,
            KW,
            Data,
            Meta
        >
    ) => any | SagaIterator;

    /**
     * Mutate kwargs passed to `resource` instance
     *
     * @param matchObj
     * @param action
     */
    mutateKwargs?: (
        matchObj: match<Params> | null,
        action: ResourcePayloadMetaAction<
            ResourceType,
            TypeConstant,
            KW,
            Data,
            Meta
        >
    ) => any | SagaIterator;

    /**
     * Mutate query passed to `resource` instance
     *
     * @param matchObj
     * @param action
     */
    mutateQuery?: (
        matchObj: match<Params> | null,
        action: ResourcePayloadMetaAction<
            ResourceType,
            TypeConstant,
            KW,
            Data,
            Meta
        >
    ) => any | SagaIterator;
}

/**
 * Resource processing saga created with `createResourceSaga`
 */
export interface ResourceSaga<
    ResourceType extends TypeConstant,
    Klass extends Resource,
    KW extends Kwargs<KW>,
    Params extends Kwargs<Params>,
    Data,
    Meta
> {
    /**
     * Resource processing saga created with `createResourceSaga`
     *
     * @param matchObj
     * @param action
     */
    (
        matchObj: match<Params> | null,
        action: ResourcePayloadMetaAction<
            ResourceType,
            TypeConstant,
            KW,
            Data,
            Meta
        >
    ): SagaIterator;

    /**
     * Create new processing saga with changed configuration options.
     *   Options default to initial configuration if value is not provided.
     *
     * @param override - Configuration overrides to change
     */
    cloneSaga: (
        override: ResourceSagaOptions<
            ResourceType,
            Klass,
            KW,
            Params,
            Data,
            Meta
        >
    ) => ResourceSaga<ResourceType, Klass, KW, Params, Data, Meta>;

    getConfiguration: () => ResourceSagaOptions<
        ResourceType,
        Klass,
        KW,
        Params,
        Data,
        Meta
    >;
}
