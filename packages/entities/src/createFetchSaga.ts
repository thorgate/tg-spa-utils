import { isFunction } from '@tg-resources/is';
import { resourceEffectFactory, SagaResource } from '@tg-resources/redux-saga-router';
import { errorActions } from '@thorgate/spa-errors';
import { normalize, schema } from 'normalizr';
import { call, delay, put, race } from 'redux-saga/effects';
import { Resource, ResourceMethods } from 'tg-resources';
import actionCreatorFactory, { Action, ActionCreator } from 'typescript-fsa';

import { setEntities } from './entitiesReducer';
import { ActionPayload } from './types';


const actionFactory = actionCreatorFactory('@@tg-spa-entities-fetch');

const normalizeData = (result: any, listSchema: schema.Entity[]): ReturnType<typeof normalize> => (
    normalize(Array.isArray(result) ? result : result.results, listSchema)
);


export const createFetchAction = <
    Params extends { [K in keyof Params]?: string | undefined; } = {}
>(type: string): ActionCreator<ActionPayload<Params>> => (
    actionFactory<ActionPayload<Params>>(type)
);


export interface NormalizedFetchOptions<
    Klass extends Resource, Params extends { [K in keyof Params]?: string | undefined; } = {}
> {
    listSchema: schema.Entity[];
    key: string;

    resource?: Klass | SagaResource<Klass>;
    method?: ResourceMethods;

    apiFetchHook?: (action: Action<ActionPayload<Params>>) => any | Iterator<any>;

    serializeData?: (result: any, listSchema: schema.Entity[]) => ReturnType<typeof normalize>;

    timeoutMs?: number;
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
        serializeData = normalizeData,
        timeoutMs = DEFAULT_TIMEOUT,
    } = options;

    return function* fetchNormalizedFetchSaga(action: Action<ActionPayload<Params>>) {
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
            const { entities, result: order } = yield call(serializeData, response, listSchema);
            yield put(setEntities({ entities, key, order }, meta));

            // If callback was added call the function
            if (isFunction(callback)) {
                callback();
            }
        } catch (error) {
            yield put(errorActions.setError(error));
        }
    };
}
