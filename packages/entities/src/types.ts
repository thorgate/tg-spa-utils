import { ActionPayload, MetaOptions, ResourceActionType, ResourceSagaOptions } from '@thorgate/create-resource-saga';
import { Kwargs, Omit } from '@thorgate/spa-is';
import { normalize, schema } from 'normalizr';
import { match } from 'react-router';
import { SagaIterator } from 'redux-saga';
import { Resource } from 'tg-resources';


export type SerializeData = (result: any, listSchema: schema.Entity[]) => ReturnType<typeof normalize>;

/**
 * Normalized fetch options
 */
export interface FetchMeta extends MetaOptions {
    /**
     * Preserve existing entities.
     *  Default: true
     */
    preserveExisting?: boolean;

    /**
     * Merge existing entities.
     *  Default: false
     */
    mergeEntities?: boolean;

    /**
     * Preserve existing order, only update existing entities.
     *  Default: false
     */
    preserveOrder?: boolean;

    /**
     * Append order to existing order.
     *  Default: false
     */
    updateOrder?: boolean;

    /**
     * Remove existing archived entities.
     *  Default: false
     */
    clearArchived?: boolean;

    /**
     * Treat fetched result as single entity.
     *  Enabled preserveOrder=true by default.
     */
    asDetails?: boolean;

    /**
     * Callback called after processing is finished.
     */
    callback?: () => void;
}


export type FetchActionType<
    T extends string,
    KW extends Kwargs<KW> = {},
    Data = any
> = ResourceActionType<T, FetchMeta, KW, Data>;

export interface FetchAction<T extends string, KW extends Kwargs<KW> = {}, Data = any> {
    (payload?: ActionPayload<KW, Data>, meta?: FetchMeta): ResourceActionType<T, FetchMeta, KW, Data>;

    getType?: () => T;
}

export interface CreateFetchSagaOptions<
    T extends string,
    Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any
> extends Omit<ResourceSagaOptions<T, Klass, FetchMeta, KW, Params, Data>, 'apiHook' | 'timeoutMessage' | 'successHook'> {
    /**
     * Entity key which is used for storage identifier
     */
    key: string;

    /**
     * Normalizr Entity list schema
     */
    listSchema: [schema.Entity];

    /**
     * Treat all response as single entity response
     */
    useDetails?: boolean;

    /**
     * Api fetch hook. This option is used when `resource` option is not provided.
     *
     * @param matchObj
     * @param action
     */
    apiFetchHook?: (matchObj: match<Params> | null, action: FetchActionType<T, KW, Data>) => (any | SagaIterator);

    /**
     * Successful request handler. This is only called when saving was successful, e.g resource or apiFetchHook did not throw any errors.
     *
     * @param result
     * @param matchObj
     * @param action
     */
    successHook?: (result: any, matchObj: match<Params> | null, action: FetchActionType<T, KW, Data>) => (any | SagaIterator);

    serializeData?: SerializeData;

    /**
     * Mutate response before serializing it.
     * @param result
     * @param action
     */
    mutateResponse?: (result: any, action: FetchActionType<T, KW, Data>) => (any | SagaIterator);
}

export type CreateFetchSagaOverrideOptions<
    T extends string,
    Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any
> = Partial<Omit<CreateFetchSagaOptions<T, Klass, KW, Params, Data>, 'key' | 'listSchema' | 'serializeData'>>;


export type InitialAction<
    T extends string,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any,
> = (matchObj: match<Params> | null) => FetchActionType<T, KW, Data>;


export interface FetchSaga<
    T extends string,
    Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any
> {
    /**
     * Resource saga to handle fetching data from api and normalize it with `normalizr`
     *
     *  If any error is thrown inside this saga, then the error is stored with `@thorgate/spa-errors`
     *
     * @param matchObj
     * @param action
     */
    (matchObj: match<Params> | null, action: ResourceActionType<T, FetchMeta, KW, Data>): SagaIterator;

    /**
     * Clone configured saga and create new saga with updated values.
     *
     * @param config - Configuration options
     */
    cloneSaga: <T0 extends string>(
        config?: CreateFetchSagaOverrideOptions<T0, Klass, KW, Params, Data>
    ) => FetchSaga<T0, Klass, KW, Params, Data>;

    /**
     * Create `@thorgate/spa-view-manager` compatible initial worker saga.
     *   **Notice:** Saga created with `asInitialWorker` throws errors so `@thorgate/spa-view-manager` could catch them and stop loading.
     *
     * @param initialAction - Initial action creator from match object
     */
    asInitialWorker: (initialAction: InitialAction<T, KW, Params, Data>) => (matchObj: match<Params> | null) => SagaIterator;

    /**
     * Bound helper to save results using pre-defined config.
     * @param result
     * @param meta
     */
    saveMany: (result: any, meta?: FetchMeta) => SagaIterator;

    /**
     * Bound helper to save result using pre-defined config.
     * @param result
     * @param meta
     */
    save: (result: any, meta?: FetchMeta) => SagaIterator;
}
