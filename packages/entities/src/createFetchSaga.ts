import {
    createResourceSaga,
    TypeConstant,
} from '@thorgate/create-resource-saga';
import {
    entitiesActions,
    EntityStatus,
    GetKeyValue,
} from '@thorgate/spa-entities-reducer';
import { errorActions } from '@thorgate/spa-errors';
import { isFunction, Kwargs } from '@thorgate/spa-is';
import { schema } from 'normalizr';
import { match } from 'react-router';
import { SagaIterator } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { Resource } from 'tg-resources';

import { getFetchSagaConfig } from './configuration';
import {
    CreateFetchSagaOptions,
    CreateFetchSagaOverrideOptions,
    EntitiesResourceType,
    FetchActionType,
    FetchMeta,
    FetchSaga,
    InitialAction,
    SerializeData,
} from './types';
import { mergeKeyOptions } from './utils';

/**
 * Serialize entities and save to entities storage
 * @param key
 * @param result
 * @param listSchema
 * @param meta
 * @param serialize
 */
export function* saveResults(
    key: string,
    result: any[],
    listSchema: [schema.Entity],
    meta: FetchMeta = {},
    serialize?: SerializeData
): SagaIterator {
    const { entities, result: order } = yield call(
        serialize || getFetchSagaConfig('serializeData'),
        result,
        listSchema
    );
    yield put(entitiesActions.setEntities({ entities, key, order }, meta));

    return { entities, order };
}

/**
 * Serialize entity and save to entities storage
 * @param key
 * @param result
 * @param detailSchema
 * @param meta
 * @param serialize
 */
export function* saveResult(
    key: string,
    result: any,
    detailSchema: schema.Entity,
    meta: FetchMeta = {},
    serialize?: SerializeData
): SagaIterator {
    return yield call(
        saveResults,
        key,
        [result],
        [detailSchema],
        { ...meta, preserveOrder: true },
        serialize
    );
}

export function createFetchSaga<
    Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any
>(
    options: CreateFetchSagaOptions<Klass, KW, Params, Data>
): FetchSaga<Klass, KW, Params, Data> {
    const {
        key,
        listSchema,
        serializeData = getFetchSagaConfig('serializeData'),

        ...baseOptions
    } = options;

    function getKeyValue(matchObj: match<Params> | null, meta: FetchMeta) {
        return GetKeyValue(
            key,
            mergeKeyOptions(matchObj, meta && meta.keyOptions)
        );
    }

    function createCloneableSaga(
        config: CreateFetchSagaOverrideOptions<Klass, KW, Params, Data> = {}
    ) {
        const mergedOptions = { ...baseOptions, ...config };

        const {
            resource,
            method,
            apiFetchHook,
            mutateKwargs,
            mutateQuery,
            mutateResponse,
            successHook,
            useDetails,
            timeoutMs,
        } = mergedOptions;

        function* saveHook(
            response: any,
            matchObj: match<Params> | null,
            action: FetchActionType<TypeConstant, KW, Data>
        ) {
            const { meta = {} } = action;

            const keyValue = getKeyValue(matchObj, meta);

            let result = response;
            if (mutateResponse) {
                result = yield call(mutateResponse, result, matchObj, action);
            }

            if (meta.asDetails || useDetails) {
                yield call(
                    saveResult,
                    keyValue,
                    result,
                    listSchema[0],
                    meta,
                    serializeData
                );
            } else {
                yield call(
                    saveResults,
                    keyValue,
                    result,
                    listSchema,
                    meta,
                    serializeData
                );
            }

            if (successHook) {
                yield call(successHook, response, matchObj, action);
            }
        }

        const saga = createResourceSaga<
            EntitiesResourceType,
            Klass,
            KW,
            Params,
            Data,
            FetchMeta
        >({
            resource,
            method,
            apiHook: apiFetchHook,
            mutateKwargs,
            mutateQuery,
            successHook: saveHook,
            timeoutMs,
            timeoutMessage: `TimeoutError: NormalizedFetch saga timed out for key: ${key}`,
        });

        function* fetchSaga(
            matchObj: match<Params> | null,
            action: FetchActionType<TypeConstant, KW, Data>
        ) {
            if (!(action as any)) {
                throw new Error(
                    `Parameter "action" is required for "fetchSaga" with key ${key}.`
                );
            }

            const { meta = {} } = action;

            const keyValue = getKeyValue(matchObj, meta);

            try {
                yield put(
                    entitiesActions.setEntitiesStatus({
                        key: keyValue,
                        status: EntityStatus.Fetching,
                    })
                );

                // Execute processing saga
                yield call(saga, matchObj, action);

                // If callback was added call the function
                if (isFunction(meta.callback)) {
                    meta.callback();
                }
                yield put(
                    entitiesActions.setEntitiesStatus({
                        key: keyValue,
                        status: EntityStatus.Fetched,
                    })
                );
            } catch (error) {
                // On errors mark saga as failed
                yield put(
                    entitiesActions.setEntitiesStatus({
                        key: keyValue,
                        status: EntityStatus.NotLoaded,
                    })
                );

                throw error;
            }
        }

        function* fetchSagaWithErrorGuard(
            matchObj: match<Params> | null,
            action: FetchActionType<TypeConstant, KW, Data>
        ) {
            try {
                yield call(fetchSaga, matchObj, action);
            } catch (error) {
                yield put(errorActions.setError(error));

                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.log(error);
                }
            }
        }

        return Object.assign(fetchSagaWithErrorGuard, {
            asInitialWorker: (
                initialAction: InitialAction<TypeConstant, KW, Params, Data>
            ) => {
                if (!isFunction(initialAction as any)) {
                    throw new Error(
                        'Parameter "initialAction" is required for "asInitialWorker".'
                    );
                }

                return function* initialWorker(matchObj: match<Params> | null) {
                    const action = yield call(initialAction, matchObj);
                    yield call(fetchSaga, matchObj, action);
                };
            },

            cloneSaga: (
                override: CreateFetchSagaOverrideOptions<
                    Klass,
                    KW,
                    Params,
                    Data
                > = {}
            ) => createCloneableSaga(override),

            getConfiguration: () => ({
                ...mergedOptions,
                key,
                listSchema,
                serializeData,
            }),

            getKeyValue,

            *saveMany(
                result: any,
                meta: FetchMeta = {},
                matchObj: match<Params> | null = null
            ) {
                const keyValue = getKeyValue(matchObj, meta);
                yield call(
                    saveResults,
                    keyValue,
                    result,
                    listSchema,
                    meta,
                    serializeData
                );
            },
            saveManyEffect: (
                result: any,
                meta: FetchMeta = {},
                matchObj: match<Params> | null = null
            ) => {
                const keyValue = getKeyValue(matchObj, meta);
                return call(
                    saveResults,
                    keyValue,
                    result,
                    listSchema,
                    meta,
                    serializeData
                );
            },

            *save(
                result: any,
                meta: FetchMeta = {},
                matchObj: match<Params> | null = null
            ) {
                const keyValue = getKeyValue(matchObj, meta);
                yield call(
                    saveResult,
                    keyValue,
                    result,
                    listSchema[0],
                    meta,
                    serializeData
                );
            },
            saveEffect: (
                result: any,
                meta: FetchMeta = {},
                matchObj: match<Params> | null = null
            ) => {
                const keyValue = getKeyValue(matchObj, meta);
                return call(
                    saveResult,
                    keyValue,
                    result,
                    listSchema[0],
                    meta,
                    serializeData
                );
            },
        });
    }

    return createCloneableSaga();
}
