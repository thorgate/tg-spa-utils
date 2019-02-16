import { resourceEffectFactory } from '@tg-resources/redux-saga-router';
import { Kwargs } from '@thorgate/spa-is';
import { match } from 'react-router';
import { call, delay, race } from 'redux-saga/effects';
import { Resource } from 'tg-resources';

import { MetaOptions, ResourceActionType, ResourceSaga, ResourceSagaOptions } from './types';


export const DEFAULT_TIMEOUT = 3000;


/**
 * Create resource saga with pre-defined settings.
 * @param options - Options to configure resource saga
 */
export function createResourceSaga<
    T extends string,
    Klass extends Resource,
    Meta extends MetaOptions = {},
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any,
>(options: ResourceSagaOptions<T, Klass, Meta, KW, Params, Data>): ResourceSaga<T, Klass, Meta, KW, Params> {
    function createCloneableSaga<T0 extends string = T>(config: ResourceSagaOptions<T0, Klass, Meta, KW, Params, Data> = {}) {
        const baseConfig = { ...options, ...config };

        const {
            timeoutMessage = 'Timeout reached, resource saga failed',
            timeoutMs = DEFAULT_TIMEOUT,

            resource,
            method = 'fetch',
            apiHook,
            mutateKwargs,
            mutateQuery,
            successHook,
        } = baseConfig;

        function* resourceSaga(
            matchObj: match<Params> | null,
            action: ResourceActionType<T0, Meta, KW, Data>
        ) {
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

            if (successHook) {
                yield call(successHook, response, matchObj, action);
            }
        }

        return Object.assign(
            resourceSaga, {
                cloneSaga: <T1 extends string>(override: ResourceSagaOptions<T1, Klass, Meta, KW, Params, Data>) => (
                    createCloneableSaga<T1>(override)
                )
            },
        );
    }

    return createCloneableSaga<T>();
}
