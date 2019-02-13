import { SagaResource } from '@tg-resources/redux-saga-router';
import { createResourceSaga } from '@thorgate/create-resource-saga';
import { errorActions } from '@thorgate/spa-errors';
import { isFunction, Kwargs } from '@thorgate/spa-is';
import { normalize, schema } from 'normalizr';
import { match } from 'react-router';
import { SagaIterator } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { Resource, ResourceMethods } from 'tg-resources';

import { entitiesActions, EntityStatus } from './entitiesReducer';
import { FetchActionType, FetchMeta, FetchSaga, InitialAction } from './types';


export type SerializeData = (result: any, listSchema: schema.Entity[]) => ReturnType<typeof normalize>;


export interface NormalizedFetchOptions<
    T extends string, Klass extends Resource, KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {}, Data = any
> {
    listSchema: [schema.Entity];
    key: string;

    resource?: Klass | SagaResource<Klass>;
    method?: ResourceMethods;

    useDetails?: boolean;

    apiFetchHook?: (matchObj: match<Params> | null, action: FetchActionType<T, KW, Data>) => (any | SagaIterator);
    successHook?: (result: any, matchObj: match<Params> | null, action: FetchActionType<T, KW, Data>) => (any | SagaIterator);

    serializeData?: SerializeData;

    timeoutMs?: number;

    mutateKwargs?: (matchObj: match<Params> | null, action: FetchActionType<T, KW, Data>) => (any | SagaIterator);
    mutateQuery?: (matchObj: match<Params> | null, action: FetchActionType<T, KW, Data>) => (any | SagaIterator);
    mutateResponse?: (result: any, action: FetchActionType<T, KW, Data>) => (any | SagaIterator);
}


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
    Data = any
>(options: NormalizedFetchOptions<T, Klass, KW, Params, Data>): FetchSaga<T, KW, Params, Data> {
    const {
        key,
        listSchema,
        resource,
        method = 'fetch',
        apiFetchHook,
        successHook,
        serializeData = normalize,
        timeoutMs,
        useDetails = false,
        mutateKwargs,
        mutateQuery,
        mutateResponse,
    } = options;

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

    const resourceSaga = createResourceSaga({
        resource,
        method,
        apiHook: apiFetchHook,
        successHook: saveHook,
        timeoutMessage: `TimeoutError: NormalizedFetch saga timed out for key: ${key}`,
        timeoutMs,
        mutateKwargs,
        mutateQuery,
    });

    function* fetchSaga(matchObj: match<Params> | null, action: FetchActionType<T, KW, Data>) {
        if (!(action as any)) {
            throw new Error(`Parameter "action" is required for "fetchSaga" with key ${key}.`);
        }

        const { meta = {} } = action;

        try {
            yield put(entitiesActions.setEntitiesStatus({ key, status: EntityStatus.Fetching }));
            yield call(resourceSaga, matchObj, action);

            // If callback was added call the function
            if (isFunction(meta.callback)) {
                meta.callback();
            }
            yield put(entitiesActions.setEntitiesStatus({ key, status: EntityStatus.Fetched }));
        } catch (error) {
            yield put(errorActions.setError(error));
        }
    }

    const asInitialWorker = (initialAction: InitialAction<T, KW, Params, Data>) => {
        if (!isFunction(initialAction as any)) {
            throw new Error('Parameter "matchToAction" is required for "asInitialWorker".');
        }

        return function* initialWorker(matchObj: match<Params> | null) {
            const action = yield call(initialAction, matchObj);
            yield call(fetchSaga, matchObj, action);
        };
    };

    return Object.assign(
        fetchSaga,
        { asInitialWorker },
    );
}
