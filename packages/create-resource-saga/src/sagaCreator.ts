import { resourceEffectFactory, SagaResource } from '@tg-resources/redux-saga-router';
import { Kwargs } from '@thorgate/spa-is';
import { match } from 'react-router';
import { SagaIterator } from 'redux-saga';
import { call, delay, race } from 'redux-saga/effects';
import { Resource, ResourceMethods } from 'tg-resources';

import { ActionType, ResourceSaga } from './types';


export const DEFAULT_TIMEOUT = 3000;


export interface ResourceSagaOptions<
    T extends string,
    Klass extends Resource,
    Meta extends {} = {},
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any,
> {
    resource?: Klass | SagaResource<Klass>;
    method?: ResourceMethods;

    apiHook?: (matchObj: match<Params> | null, action: ActionType<T, Meta, KW, Data>) => (any | SagaIterator);
    successHook: (result: any, matchObj: match<Params> | null, action: ActionType<T, Meta, KW, Data>) => (any | SagaIterator);

    timeoutMessage?: string;
    timeoutMs?: number;

    mutateKwargs?: (matchObj: match<Params> | null, action: ActionType<T, Meta, KW, Data>) => (any | SagaIterator);
    mutateQuery?: (matchObj: match<Params> | null, action: ActionType<T, Meta, KW, Data>) => (any | SagaIterator);
}


export function createResourceSaga<
    T extends string,
    Klass extends Resource,
    Meta extends {} = {},
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any,
>(options: ResourceSagaOptions<T, Klass, Meta, KW, Params, Data>): ResourceSaga<T, Meta, KW, Params> {
    const {
        resource,
        method = 'fetch',
        apiHook,
        successHook,
        timeoutMessage = 'Timeout reached, resource saga failed',
        timeoutMs = DEFAULT_TIMEOUT,
        mutateKwargs,
        mutateQuery,
    } = options;

    return function* resourceSaga(matchObj: match<Params> | null, action: ActionType<T, Meta, KW, Data>) {
        const { payload = {} } = action;

        let resourceEffect: any;

        let { kwargs = null, query = null } = payload;

        if (mutateKwargs) {
            kwargs = yield call(mutateKwargs, matchObj, action);
        }

        if (mutateQuery) {
            query = yield call(mutateQuery, matchObj, action);
        }

        if (resource) {
            resourceEffect = resourceEffectFactory(resource, method, {
                kwargs,
                query,
                data: payload.data,
                attachments: payload.attachments,
                requestConfig: { initializeSaga: false }, // Disable initialized saga in this context
            });
        } else if (apiHook) {
            resourceEffect = call(apiHook, matchObj, action);
        } else {
            throw new Error('Misconfiguration: "resource" or "apiFetchHook" is required');
        }

        const { response, timeout } = yield race({
            timeout: delay(timeoutMs, true),
            response: resourceEffect,
        });

        if (timeout) {
            throw new Error(timeoutMessage);
        }

        yield call(successHook, response, matchObj, action);
    };
}
