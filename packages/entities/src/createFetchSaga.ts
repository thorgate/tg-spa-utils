import { createResourceSaga } from '@thorgate/create-resource-saga';
import { errorActions } from '@thorgate/spa-errors';
import { isFunction, Kwargs } from '@thorgate/spa-is';
import { normalize, schema } from 'normalizr';
import { match } from 'react-router';
import { SagaIterator } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { Resource } from 'tg-resources';

import { entitiesActions, EntityStatus } from './entitiesReducer';
import {
    CreateFetchSagaOptions,
    CreateFetchSagaOverrideOptions,
    FetchActionType,
    FetchMeta, FetchSaga,
    InitialAction,
    SerializeData
} from './types';


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


export function createFetchSaga<
    T extends string,
    Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any,
>(options: CreateFetchSagaOptions<T, Klass, KW, Params, Data>): FetchSaga<T, Klass, KW, Params, Data> {
    const {
        key,
        listSchema,
        serializeData = normalize,

        ...baseOptions
    } = options;

    function createCloneableSaga(config: CreateFetchSagaOverrideOptions<T, Klass, KW, Params, Data> = {}) {
        const baseConfig = { ...baseOptions, ...config };

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
        } = baseConfig;

        function* saveHook(response: any, matchObj: match<Params> | null, action: FetchActionType<T, KW, Data>) {
            const { meta = {} } = action;

            let result = response;
            if (mutateResponse) {
                result = yield call(mutateResponse, result, action);
            }

            if (meta.asDetails || useDetails) {
                yield call(saveResult, key, result, listSchema[0], meta, serializeData);
            } else {
                yield call(saveResults, key, result, listSchema, meta, serializeData);
            }

            if (successHook) {
                yield call(successHook, response, matchObj, action);
            }
        }

        const saga = createResourceSaga<T, Klass, FetchMeta, KW, Params, Data>({
            resource,
            method,
            apiHook: apiFetchHook,
            mutateKwargs,
            mutateQuery,
            successHook: saveHook,
            timeoutMs,
            timeoutMessage: `TimeoutError: NormalizedFetch saga timed out for key: ${key}`,
        });

        function* fetchSaga(matchObj: match<Params> | null, action: FetchActionType<T, KW, Data>) {
            if (!(action as any)) {
                throw new Error(`Parameter "action" is required for "fetchSaga" with key ${key}.`);
            }

            const { meta = {} } = action;

            yield put(entitiesActions.setEntitiesStatus({ key, status: EntityStatus.Fetching }));

            // Execute processing saga
            yield call(saga, matchObj, action);

            // If callback was added call the function
            if (isFunction(meta.callback)) {
                meta.callback();
            }
            yield put(entitiesActions.setEntitiesStatus({ key, status: EntityStatus.Fetched }));
        }

        function* fetchSagaWithErrorGuard(matchObj: match<Params> | null, action: FetchActionType<T, KW, Data>) {
            try {
                yield call(fetchSaga, matchObj, action);
            } catch (error) {
                yield put(errorActions.setError(error));
            }
        }

        return Object.assign(
            fetchSagaWithErrorGuard,
            {
                asInitialWorker: (initialAction: InitialAction<T, KW, Params, Data>) => {
                    if (!isFunction(initialAction as any)) {
                        throw new Error('Parameter "initialAction" is required for "asInitialWorker".');
                    }

                    return function* initialWorker(matchObj: match<Params> | null) {
                        const action = yield call(initialAction, matchObj);
                        yield call(fetchSaga, matchObj, action);
                    };
                },

                cloneSaga: <T1 extends string>(override: CreateFetchSagaOverrideOptions<T1, Klass, KW, Params, Data> = {}) => (
                    createCloneableSaga(override as CreateFetchSagaOverrideOptions<T, Klass, KW, Params, Data>) as any
                ) as FetchSaga<T1, Klass, KW, Params, Data>,

                * saveMany(result: any, meta: FetchMeta = {}) {
                    yield call(saveResults, key, result, listSchema, meta, serializeData);
                },

                * save(result: any, meta: FetchMeta = {}) {
                    yield call(saveResult, key, result, listSchema[0], meta, serializeData);
                },
            },
        );
    }

    return createCloneableSaga();
}
