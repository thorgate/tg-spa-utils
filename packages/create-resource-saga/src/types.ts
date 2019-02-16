import { SagaResource } from '@tg-resources/redux-saga-router';
import { Kwargs } from '@thorgate/spa-is';
import { match } from 'react-router';
import { SagaIterator } from 'redux-saga';
import { Attachments, Query, Resource, ResourceMethods } from 'tg-resources';


/**
 * Resource action payload
 */
export interface ActionPayload<
    KW extends Kwargs<KW> = {}, Data = any
> {
    kwargs?: KW | null;
    query?: Query | null;
    data?: Data;
    attachments?: Attachments | null;
    method?: ResourceMethods;
}

/**
 * Base meta options supported by
 */
export interface MetaOptions {
    [key: string]: any;
}

/**
 * Resource action type expected by ResourceSaga
 */
export interface ResourceActionType <
    T extends string, Meta extends MetaOptions = {}, KW extends Kwargs<KW> = {}, Data = any
> {
    type: T;
    payload: ActionPayload<KW, Data>;
    meta: Meta;
}


export interface ResourceSagaOptions<
    T extends string,
    Klass extends Resource,
    Meta extends MetaOptions = {},
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any,
> {
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
    apiHook?: (matchObj: match<Params> | null, action: ResourceActionType<T, Meta, KW, Data>) => (any | SagaIterator);

    /**
     * Success handler called when requests succeeds
     *
     * @param result
     * @param matchObj
     * @param action
     */
    successHook?: (result: any, matchObj: match<Params> | null, action: ResourceActionType<T, Meta, KW, Data>) => (any | SagaIterator);

    /**
     * Mutate kwargs passed to `resource` instance
     *
     * @param matchObj
     * @param action
     */
    mutateKwargs?: (matchObj: match<Params> | null, action: ResourceActionType<T, Meta, KW, Data>) => (any | SagaIterator);

    /**
     * Mutate query passed to `resource` instance
     *
     * @param matchObj
     * @param action
     */
    mutateQuery?: (matchObj: match<Params> | null, action: ResourceActionType<T, Meta, KW, Data>) => (any | SagaIterator);

    /**
     * Error message thrown when timeout occurs
     */
    timeoutMessage?: string;

    /**
     * Request timeout in milliseconds
     *  Default: 3000
     */
    timeoutMs?: number;
}


/**
 * Resource processing saga created with `createResourceSaga`
 */
export interface ResourceSaga<
    T extends string,
    Klass extends Resource,
    Meta extends {} = {},
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any,
> {
    /**
     * Resource processing saga created with `createResourceSaga`
     *
     * @param matchObj
     * @param action
     */
    (matchObj: match<Params> | null, action: ResourceActionType<T, Meta, KW, Data>): SagaIterator;

    /**
     * Create new processing saga with changed configuration options.
     *   Options default to initial configuration if value is not provided.
     *
     * @param overrides - Configuration overrides to change
     */
    cloneSaga<T0 extends string>(
        overrides: ResourceSagaOptions<T0, Klass, Meta, KW, Params, Data>
    ): ResourceSaga<T0, Klass, Meta, KW, Params, Data>;
}
