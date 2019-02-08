import { isFunction } from '@tg-resources/is';
import { SagaResource } from '@tg-resources/redux-saga-router';
import { ActionType, createResourceSaga } from '@thorgate/create-resource-saga';
import { errorActions } from '@thorgate/spa-errors';
import { normalize, schema } from 'normalizr';
import { match } from 'react-router';
import { call, put } from 'redux-saga/effects';
import { Query, Resource, ResourceMethods } from 'tg-resources';

import { entitiesActions, EntityStatus } from './entitiesReducer';
import { FetchMeta } from './types';


export type SerializeData = (result: any, listSchema: schema.Entity[]) => ReturnType<typeof normalize>;


export interface NormalizedFetchOptions<
    T extends string, Klass extends Resource, Kwargs extends { [K in keyof Kwargs]?: string | undefined; } = {},
    Params extends { [K in keyof Params]?: string | undefined; } = {}, Data = any
> {
    listSchema: [schema.Entity];
    key: string;

    resource?: Klass | SagaResource<Klass>;
    method?: ResourceMethods;

    apiFetchHook?: (matchObj: match<Params> | null, action?: ActionType<T, FetchMeta, Kwargs, Data>) => any;
    successHook?: (result: any, matchObj: match<Params> | null, action?: ActionType<T, FetchMeta, Kwargs, Data>) => any;

    serializeData?: SerializeData;

    timeoutMs?: number;

    mutateKwargs?: (matchObj: match<Params> | null, kwargs: Kwargs | null) => any;
    mutateQuery?: (matchObj: match<Params> | null, query: Query | null) => any;
}


export function* saveResults(
    key: string,
    result: any[],
    listSchema: [schema.Entity],
    meta: FetchMeta = {},
    serialize: SerializeData = normalize
) {
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
) {
    return yield call(saveResults, key, [result], [detailSchema], { ...meta, preserveOrder: true }, serialize);
}


export function createFetchSaga<
    T extends string, Klass extends Resource, Kwargs extends { [K in keyof Kwargs]?: string | undefined; } = {},
    Params extends { [K in keyof Params]?: string | undefined; } = {}, Data = any
>(options: NormalizedFetchOptions<T, Klass, Kwargs, Params, Data>) {
    const {
        key,
        listSchema,
        resource,
        method = 'fetch',
        apiFetchHook,
        successHook,
        serializeData = normalize,
        timeoutMs,
        mutateKwargs,
        mutateQuery,
    } = options;

    function* saveHook(response: any, matchObj: match<Params> | null, action?: ActionType<T, FetchMeta, Kwargs, Data>) {
        const { meta = {} } = action || {};

        if (meta.asDetails) {
            yield call(saveResult, key, response, listSchema[0], meta, serializeData);
        } else {
            yield call(saveResults, key, response, listSchema, meta, serializeData);
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

    return function* fetchSaga(matchObj: match<Params> | null, action?: ActionType<T, FetchMeta, Kwargs, Data>) {
        const { meta = {} } = action || {};

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
    };
}
