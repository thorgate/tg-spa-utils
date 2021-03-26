import {
    ResourcePayloadMetaAction,
    ResourceSagaOptions,
    TypeConstant,
} from '@thorgate/create-resource-saga';
import { EntitiesMeta, Key, KeyOptions } from '@thorgate/spa-entities-reducer';
import { Kwargs } from '@thorgate/spa-is';
import { normalize, schema } from 'normalizr';
import { match } from 'react-router';
import { SagaIterator } from 'redux-saga';
import { CallEffect } from 'redux-saga/effects';
import { Resource } from 'tg-resources';

export type SerializeData = (
    result: any,
    listSchema: schema.Entity[]
) => ReturnType<typeof normalize>;

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
    T extends TypeConstant,
    KW extends Kwargs<KW> = Record<string, string | undefined>,
    Data = any
> = ResourcePayloadMetaAction<T, KW, Data, FetchMeta>;

export interface FetchSagaConfig {
    serializeData: SerializeData;
}

export interface CreateFetchSagaOptions<
    Klass extends Resource,
    KW extends Kwargs<KW> = Record<string, string | undefined>,
    Params extends Kwargs<Params> = Record<string, string | undefined>,
    Data = any
> extends Partial<FetchSagaConfig>,
        Omit<
            ResourceSagaOptions<Klass, KW, Params, Data, FetchMeta>,
            'apiHook' | 'timeoutMessage' | 'successHook'
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
    apiFetchHook?: (
        matchObj: match<Params> | null,
        action: FetchActionType<TypeConstant, KW, Data>
    ) => any | SagaIterator;

    /**
     * Successful request handler. This is only called when saving was successful, e.g resource or apiFetchHook did not throw any errors.
     *
     * @param result
     * @param matchObj
     * @param action
     */
    successHook?: (
        result: any,
        matchObj: match<Params> | null,
        action: FetchActionType<TypeConstant, KW, Data>
    ) => any | SagaIterator;

    /**
     * Mutate response before serializing it.
     * @param result
     * @param matchObj
     * @param action
     */
    mutateResponse?: (
        result: any,
        matchObj: match<Params> | null,
        action: FetchActionType<TypeConstant, KW, Data>
    ) => any | SagaIterator;
}

export type CreateFetchSagaOverrideOptions<
    Klass extends Resource,
    KW extends Kwargs<KW> = Record<string, string | undefined>,
    Params extends Kwargs<Params> = Record<string, string | undefined>,
    Data = any
> = Partial<
    Omit<
        CreateFetchSagaOptions<Klass, KW, Params, Data>,
        'key' | 'listSchema' | 'serializeData'
    >
>;

export type InitialAction<
    T extends TypeConstant,
    KW extends Kwargs<KW> = Record<string, string | undefined>,
    Params extends Kwargs<Params> = Record<string, string | undefined>,
    Data = any
> = (matchObj: match<Params> | null) => FetchActionType<T, KW, Data>;

export interface FetchSaga<
    Klass extends Resource,
    KW extends Kwargs<KW> = Record<string, string | undefined>,
    Params extends Kwargs<Params> = Record<string, string | undefined>,
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
    (
        matchObj: match<Params> | null,
        action: FetchActionType<TypeConstant, KW, Data>
    ): SagaIterator;

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
    asInitialWorker: (
        initialAction: InitialAction<TypeConstant, KW, Params, Data>
    ) => (matchObj: match<Params> | null) => SagaIterator;

    /**
     * Bound helper to save results using pre-defined config.
     * @param result
     * @param meta
     * @param matchObj
     */
    saveMany: (
        result: any,
        meta?: FetchMeta,
        matchObj?: match<Params> | null
    ) => SagaIterator;

    /**
     * Bound helper to save results using pre-defined config.
     * @param result
     * @param meta
     * @param matchObj
     */
    saveManyEffect: (
        result: any,
        meta?: FetchMeta,
        matchObj?: match<Params> | null
    ) => CallEffect;

    /**
     * Bound helper to save result using pre-defined config.
     * @param result
     * @param meta
     * @param matchObj
     */
    save: (
        result: any,
        meta?: FetchMeta,
        matchObj?: match<Params> | null
    ) => SagaIterator;

    /**
     * Bound helper to save result using pre-defined config.
     * @param result
     * @param meta
     * @param matchObj
     */
    saveEffect: (
        result: any,
        meta?: FetchMeta,
        matchObj?: match<Params> | null
    ) => CallEffect;
}
