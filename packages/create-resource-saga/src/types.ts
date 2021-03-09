import { PayloadAction, PayloadActionCreator } from '@reduxjs/toolkit';
import { SagaResource } from '@tg-resources/redux-saga-router';
import { Kwargs } from '@thorgate/spa-is';
import { match } from 'react-router';
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

export type ResourcePayloadMetaAction<
    Type extends TypeConstant,
    KW extends Kwargs<KW>,
    Data,
    Meta = undefined
> = PayloadAction<ResourceActionPayload<KW, Data>, Type, Meta>;

export type ResourceActionCreator<
    Type extends TypeConstant,
    KW extends Kwargs<KW>,
    Data,
    Meta = undefined
> = PayloadActionCreator<
    ResourceActionPayload<KW, Data>,
    Type,
    (
        p?: ResourceActionPayload<KW, Data>,
        meta?: Meta
    ) => ResourcePayloadMetaAction<Type, KW, Data, Meta>
>;

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
        action: ResourcePayloadMetaAction<TypeConstant, KW, Data, Meta>
    ) => any | Iterator<any>;

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
        action: ResourcePayloadMetaAction<TypeConstant, KW, Data, Meta>
    ) => any | Iterator<any>;

    /**
     * Mutate kwargs passed to `resource` instance
     *
     * @param matchObj
     * @param action
     */
    mutateKwargs?: (
        matchObj: match<Params> | null,
        action: ResourcePayloadMetaAction<TypeConstant, KW, Data, Meta>
    ) => any | Iterator<any>;

    /**
     * Mutate query passed to `resource` instance
     *
     * @param matchObj
     * @param action
     */
    mutateQuery?: (
        matchObj: match<Params> | null,
        action: ResourcePayloadMetaAction<TypeConstant, KW, Data, Meta>
    ) => any | Iterator<any>;
}

/**
 * Resource processing saga created with `createResourceSaga`
 */
export interface ResourceSaga<
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
        action: ResourcePayloadMetaAction<TypeConstant, KW, Data, Meta>
    ): Iterator<any>;

    /**
     * Create new processing saga with changed configuration options.
     *   Options default to initial configuration if value is not provided.
     *
     * @param override - Configuration overrides to change
     */
    cloneSaga: (
        override: ResourceSagaOptions<Klass, KW, Params, Data, Meta>
    ) => ResourceSaga<Klass, KW, Params, Data, Meta>;

    getConfiguration: () => ResourceSagaOptions<Klass, KW, Params, Data, Meta>;
}
