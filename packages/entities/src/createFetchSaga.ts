import { createResourceSaga, StringOrSymbol } from '@thorgate/create-resource-saga';
import { entitiesActions, EntityStatus } from '@thorgate/spa-entities-reducer';
import { errorActions } from '@thorgate/spa-errors';
import { isFunction, Kwargs } from '@thorgate/spa-is';
import { normalize, schema } from 'normalizr';
import { match } from 'react-router';
import { SagaIterator } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { Resource } from 'tg-resources';

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
import { GetKeyValue } from './utils';


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
    serialize: SerializeData = normalize
): SagaIterator {
    const { entities, result: order } = yield call(serialize, result, listSchema);
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
    serialize: SerializeData = normalize
): SagaIterator {
    return yield call(saveResults, key, [result], [detailSchema], { ...meta, preserveOrder: true }, serialize);
}


export function createFetchSaga<Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any,
    >(options: CreateFetchSagaOptions<Klass, KW, Params, Data>): FetchSaga<Klass, KW, Params, Data> {
    const {
        key,
        listSchema,
        serializeData = normalize,

        ...baseOptions
    } = options;

    function createCloneableSaga(config: CreateFetchSagaOverrideOptions<Klass, KW, Params, Data> = {}) {
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

        function* saveHook(response: any, matchObj: match<Params> | null, action: FetchActionType<StringOrSymbol, KW, Data>) {
            const { meta = {} } = action;

            const keyValue = GetKeyValue(key, matchObj);

            let result = response;
            if (mutateResponse) {
                result = yield call(mutateResponse, result, matchObj, action);
            }

            if (meta.asDetails || useDetails) {
                yield call(saveResult, keyValue, result, listSchema[0], meta, serializeData);
            } else {
                yield call(saveResults, keyValue, result, listSchema, meta, serializeData);
            }

            if (successHook) {
                yield call(successHook, response, matchObj, action);
            }
        }

        const saga = createResourceSaga<EntitiesResourceType, Klass, KW, Params, Data, FetchMeta>({
            resource,
            method,
            apiHook: apiFetchHook,
            mutateKwargs,
            mutateQuery,
            successHook: saveHook,
            timeoutMs,
            timeoutMessage: `TimeoutError: NormalizedFetch saga timed out for key: ${key}`,
        });

        function* fetchSaga(matchObj: match<Params> | null, action: FetchActionType<StringOrSymbol, KW, Data>) {
            if (!(action as any)) {
                throw new Error(`Parameter "action" is required for "fetchSaga" with key ${key}.`);
            }

            const keyValue = GetKeyValue(key, matchObj);

            try {
                const { meta = {} } = action;

                yield put(entitiesActions.setEntitiesStatus({ key: keyValue, status: EntityStatus.Fetching }));

                // Execute processing saga
                yield call(saga, matchObj, action);

                // If callback was added call the function
                if (isFunction(meta.callback)) {
                    meta.callback();
                }
                yield put(entitiesActions.setEntitiesStatus({ key: keyValue, status: EntityStatus.Fetched }));
            } catch (error) {
                // On errors mark saga as failed
                yield put(entitiesActions.setEntitiesStatus({ key: keyValue, status: EntityStatus.NotLoaded }));

                throw error;
            }
        }

        function* fetchSagaWithErrorGuard(matchObj: match<Params> | null, action: FetchActionType<StringOrSymbol, KW, Data>) {
            try {
                yield call(fetchSaga, matchObj, action);
            } catch (error) {
                yield put(errorActions.setError(error));

                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
            }
        }

        return Object.assign(
            fetchSagaWithErrorGuard,
            {
                asInitialWorker: (initialAction: InitialAction<StringOrSymbol, KW, Params, Data>) => {
                    if (!isFunction(initialAction as any)) {
                        throw new Error('Parameter "initialAction" is required for "asInitialWorker".');
                    }

                    return function* initialWorker(matchObj: match<Params> | null) {
                        const action = yield call(initialAction, matchObj);
                        yield call(fetchSaga, matchObj, action);
                    };
                },

                cloneSaga: (override: CreateFetchSagaOverrideOptions<Klass, KW, Params, Data> = {}) => (
                    createCloneableSaga(override)
                ),

                getConfiguration: () => ({ ...mergedOptions, key, listSchema, serializeData }),

                * saveMany(result: any, meta: FetchMeta = {}, matchObj: match<Params> | null = null) {
                    const keyValue = GetKeyValue(key, matchObj);
                    yield call(saveResults, keyValue, result, listSchema, meta, serializeData);
                },
                saveManyEffect: (result: any, meta: FetchMeta = {}, matchObj: match<Params> | null = null) => {
                    const keyValue = GetKeyValue(key, matchObj);
                    return call(saveResults, keyValue, result, listSchema, meta, serializeData);
                },

                * save(result: any, meta: FetchMeta = {}, matchObj: match<Params> | null = null) {
                    const keyValue = GetKeyValue(key, matchObj);
                    yield call(saveResult, keyValue, result, listSchema[0], meta, serializeData);
                },
                saveEffect: (result: any, meta: FetchMeta = {}, matchObj: match<Params> | null = null) => {
                    const keyValue = GetKeyValue(key, matchObj);
                    return call(saveResult, keyValue, result, listSchema[0], meta, serializeData);
                },
            },
        );
    }

    return createCloneableSaga();
}
