import { ResourceActionPayload, ResourcePayloadMetaAction, ResourceSagaOptions, StringOrSymbol } from '@thorgate/create-resource-saga';
import { EntitiesMeta, EntitiesRootState } from '@thorgate/spa-entities-reducer';
import { Kwargs, Omit } from '@thorgate/spa-is';
import { normalize, schema } from 'normalizr';
import { match } from 'react-router';
import { SagaIterator } from 'redux-saga';
import { CallEffect } from 'redux-saga/effects';
import { Resource } from 'tg-resources';


export const EntitiesResource = '@@thorgate/spa-entities';
export type EntitiesResourceType = typeof EntitiesResource;


export type SerializeData = (result: any, listSchema: schema.Entity[]) => ReturnType<typeof normalize>;


export interface KeyOptions {
    [key: string]: any;
}


/**
 * Normalized fetch options
 */
export interface FetchMeta extends EntitiesMeta {
    /**
     * Treat fetched result as single entity.
     *  Enabled preserveOrder=true by default.
     */
    asDetails?: boolean;

    /**
     * Callback called after processing is finished.
     */
    callback?: () => void;

    keyOptions?: KeyOptions;
}


export type FetchActionType<
    T extends StringOrSymbol,
    KW extends Kwargs<KW> = {},
    Data = any
> = ResourcePayloadMetaAction<EntitiesResourceType, T, KW, Data, FetchMeta>;


export interface FetchAction<
    T extends StringOrSymbol,
    KW extends Kwargs<KW> = {},
    Data = any
> {
    (payload?: ResourceActionPayload<KW, Data>, meta?: FetchMeta): FetchActionType<T, KW, Data>;

    getType?: () => T;
    getResourceType?: () => EntitiesResourceType;
}


export type KeyFn = (keyOptions: KeyOptions | null) => string;
export type Key = string | KeyFn;


interface InvalidateExtension {
    invalidate: () => void;
}

export interface ListSchemaSelector<RType> extends InvalidateExtension {
    <S extends EntitiesRootState>(state: S, ids?: Array<string | number>): RType[];
}
export interface ListKeyOptionsSchemaSelector<RType> extends InvalidateExtension {
    <S extends EntitiesRootState>(state: S, keyOptions: KeyOptions | null, ids?: Array<string | number>): RType[];
}

export interface DetailSchemaSelector<RType> extends InvalidateExtension {
    <S extends EntitiesRootState>(state: S, id: string | number): RType | null;
}


export interface CreateFetchSagaOptions<
    Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any
> extends Omit<
    ResourceSagaOptions<EntitiesResourceType, Klass, KW, Params, Data, FetchMeta>, 'apiHook' | 'timeoutMessage' | 'successHook'
> {
    /**
     * Entity key which is used for storage identifier
     */
    key: Key;

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
    apiFetchHook?: (matchObj: match<Params> | null, action: FetchActionType<StringOrSymbol, KW, Data>) => (any | SagaIterator);

    /**
     * Successful request handler. This is only called when saving was successful, e.g resource or apiFetchHook did not throw any errors.
     *
     * @param result
     * @param matchObj
     * @param action
     */
    successHook?: (result: any, matchObj: match<Params> | null, action: FetchActionType<StringOrSymbol, KW, Data>) => (any | SagaIterator);

    serializeData?: SerializeData;

    /**
     * Mutate response before serializing it.
     * @param result
     * @param matchObj
     * @param action
     */
    mutateResponse?: (
        result: any, matchObj: match<Params> | null, action: FetchActionType<StringOrSymbol, KW, Data>
    ) => (any | SagaIterator);
}

export type CreateFetchSagaOverrideOptions<
    Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any
> = Partial<Omit<CreateFetchSagaOptions<Klass, KW, Params, Data>, 'key' | 'listSchema' | 'serializeData'>>;


export type InitialAction<
    T extends StringOrSymbol,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any,
> = (matchObj: match<Params> | null) => FetchActionType<T, KW, Data>;


export interface FetchSaga<
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
    (matchObj: match<Params> | null, action: FetchActionType<StringOrSymbol, KW, Data>): SagaIterator;

    /**
     * Clone configured saga and create new saga with updated values.
     *
     * @param config - Configuration options
     */
    cloneSaga: (
        config?: CreateFetchSagaOverrideOptions<Klass, KW, Params, Data>
    ) => FetchSaga<Klass, KW, Params, Data>;

    /**
     * Get currently used resource saga config.
     */
    getConfiguration: () => CreateFetchSagaOptions<Klass, KW, Params, Data>;

    getKeyValue: (matchObj: match<Params> | null, meta: FetchMeta) => string;

    /**
     * Create `@thorgate/spa-view-manager` compatible initial worker saga.
     *   **Notice:** Saga created with `asInitialWorker` throws errors so `@thorgate/spa-view-manager` could catch them and stop loading.
     *
     * @param initialAction - Initial action creator from match object
     */
    asInitialWorker: (initialAction: InitialAction<StringOrSymbol, KW, Params, Data>) => (matchObj: match<Params> | null) => SagaIterator;

    /**
     * Bound helper to save results using pre-defined config.
     * @param result
     * @param meta
     * @param matchObj
     */
    saveMany: (result: any, meta?: FetchMeta, matchObj?: match<Params> | null) => SagaIterator;

    /**
     * Bound helper to save results using pre-defined config.
     * @param result
     * @param meta
     * @param matchObj
     */
    saveManyEffect: (result: any, meta?: FetchMeta, matchObj?: match<Params> | null) => CallEffect;

    /**
     * Bound helper to save result using pre-defined config.
     * @param result
     * @param meta
     * @param matchObj
     */
    save: (result: any, meta?: FetchMeta, matchObj?: match<Params> | null) => SagaIterator;

    /**
     * Bound helper to save result using pre-defined config.
     * @param result
     * @param meta
     * @param matchObj
     */
    saveEffect: (result: any, meta?: FetchMeta, matchObj?: match<Params> | null) => CallEffect;
}
