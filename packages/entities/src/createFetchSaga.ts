import { isFunction } from '@tg-resources/is';
import { resourceEffectFactory, SagaResource } from '@tg-resources/redux-saga-router';
import { errorActions } from '@thorgate/spa-errors';
import { normalize, schema } from 'normalizr';
import { call, delay, put, race } from 'redux-saga/effects';
import { Resource, ResourceMethods } from 'tg-resources';
import { createAction } from 'typesafe-actions';

import { entitiesActions } from './entitiesReducer';
import { ActionPayload, SetStateMetaOptions } from './types';


export interface ActionType <
    Params extends { [K in keyof Params]?: string | undefined; } = {}
> {
    type: string;
    payload: ActionPayload<Params>;
    meta: SetStateMetaOptions;
}

export type FetchAction<
    Params extends { [K in keyof Params]?: string | undefined; } = {}
> = (payload: ActionPayload<Params>, meta?: SetStateMetaOptions) => ActionType<Params>;

export const createFetchAction = <
    Params extends { [K in keyof Params]?: string | undefined; } = {}
>(type: string): FetchAction<Params> => (
    createAction(`@@tg-spa-entities-fetch/${type}`, (resolve) => (
        (payload: ActionPayload<Params>, meta: SetStateMetaOptions = {}) => (
            resolve(payload, meta)
        )
    ))
);


export type SerializeData = (result: any, listSchema: schema.Entity[]) => ReturnType<typeof normalize>;


export interface NormalizedFetchOptions<
    Klass extends Resource, Params extends { [K in keyof Params]?: string | undefined; } = {}
> {
    listSchema: schema.Entity[];
    key: string;

    resource?: Klass | SagaResource<Klass>;
    method?: ResourceMethods;

    apiFetchHook?: (action: ActionType<Params>) => any | Iterator<any>;

    serializeData?: SerializeData;

    timeoutMs?: number;
}


export function* saveResult(
    key: string,
    result: any,
    detailSchema: schema.Entity,
    meta: SetStateMetaOptions = {},
    serialize: SerializeData = normalize
) {
    const { entities } = yield call(serialize, [result], [detailSchema]);
    yield put(entitiesActions.setEntities({ entities, key, order: [] }, { ...meta, skipOrder: true }));
}


export function* saveResults(
    key: string,
    result: any,
    listSchema: schema.Entity[],
    meta: SetStateMetaOptions = {},
    serialize: SerializeData = normalize
) {
    const { entities, result: order } = yield call(serialize, result, listSchema);
    yield put(entitiesActions.setEntities({ entities, key, order }, meta));
}


export const DEFAULT_TIMEOUT = 3000;

export class TimeoutError extends Error {
    public readonly key: string;

    public constructor(key: string) {
        super();
        this.key = key;

        this.message = `TimeoutError: NormalizedFetch saga timed out for key: ${key}`;
    }
}


export function createFetchSaga<
    Klass extends Resource, Params extends { [K in keyof Params]?: string | undefined; } = {}
>(options: NormalizedFetchOptions<Klass, Params>) {
    const {
        key,
        listSchema,
        resource,
        method = 'fetch',
        apiFetchHook,
        serializeData = normalize,
        timeoutMs = DEFAULT_TIMEOUT,
    } = options;

    return function* fetchNormalizedFetchSaga(action: ActionType<Params>) {
        const { callback = null } = action.payload;
        const { meta = {} } = action;

        try {
            let fetchEffect: any;

            if (resource) {
                fetchEffect = resourceEffectFactory(resource, method, {
                    kwargs: action.payload.kwargs,
                    query: action.payload.query,
                    data: action.payload.data,
                    requestConfig: { initializeSaga: false }, // Disable initialized saga in this context
                });
            } else if (apiFetchHook) {
                fetchEffect = call(apiFetchHook, action);
            } else {
                throw new Error(`Misconfiguration: "resource" or "apiFetchHook" is required for "${key}"`);
            }

            const { response, timeout } = yield race({
                timeout: delay(timeoutMs, true),
                response: fetchEffect,
            });

            if (timeout) {
                throw new TimeoutError(key);
            }

            // Serialize data and update store
            yield call(saveResults, key, response, listSchema, meta, serializeData);

            // If callback was added call the function
            if (isFunction(callback)) {
                callback();
            }
        } catch (error) {
            yield put(errorActions.setError(error));
        }
    };
}
