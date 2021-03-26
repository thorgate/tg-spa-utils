import { resourceEffectFactory } from '@tg-resources/redux-saga-router';
import { Kwargs } from '@thorgate/spa-is';
import { match } from 'react-router';
import { call, delay, race } from 'redux-saga/effects';
import { Resource } from 'tg-resources';

import { validateResourceAction } from './actionCheck';
import { getBaseConfig } from './configuration';
import {
    ResourcePayloadMetaAction,
    ResourceSaga,
    ResourceSagaOptions,
    TypeConstant,
} from './types';

/**
 * Create resource saga with pre-defined settings.
 * @param options - Options to configure resource saga
 */
export function createResourceSaga<
    Klass extends Resource,
    KW extends Kwargs<KW>,
    Params extends Kwargs<Params>,
    Data = any,
    Meta = undefined
>(
    options: ResourceSagaOptions<Klass, KW, Params, Data, Meta>
): ResourceSaga<Klass, KW, Params, Data, Meta> {
    function createCloneableSaga(
        config: ResourceSagaOptions<Klass, KW, Params, Data, Meta> = {}
    ) {
        const mergedOptions = { ...options, ...config };

        const {
            timeoutMessage = getBaseConfig('timeoutMessage'),
            timeoutMs = getBaseConfig('timeoutMs'),

            resource,
            method = 'fetch',
            apiHook,
            mutateKwargs,
            mutateQuery,
            successHook,
        } = mergedOptions;

        function* resourceSaga(
            matchObj: match<Params> | null,
            action: ResourcePayloadMetaAction<TypeConstant, KW, Data, Meta>
        ) {
            // Expect action created with createResourceAction
            validateResourceAction(action.type, 'type', 'Action');

            const { payload } = action;

            let resourceEffect: any;

            let { kwargs = null, query = null } = payload;

            if (mutateKwargs) {
                kwargs = yield call(mutateKwargs, matchObj, action);
            }

            if (mutateQuery) {
                query = yield call(mutateQuery, matchObj, action);
            }

            if (resource) {
                resourceEffect = resourceEffectFactory(
                    resource,
                    payload.method || method,
                    {
                        kwargs,
                        query,
                        data: payload.data,
                        attachments: payload.attachments,
                        requestConfig: { initializeSaga: false }, // Disable initialized saga in this context
                    }
                );
            } else if (apiHook) {
                resourceEffect = call(
                    apiHook,
                    matchObj,
                    Object.assign({}, action, {
                        payload: Object.assign({}, payload, { kwargs, query }),
                    })
                );
            } else {
                throw new Error(
                    'Misconfiguration: "resource" or "apiHook" is required'
                );
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

        return Object.assign(resourceSaga, {
            cloneSaga: (
                override: ResourceSagaOptions<Klass, KW, Params, Data, Meta>
            ) => createCloneableSaga(override),

            getConfiguration: () => ({
                ...mergedOptions,
                method,
                timeoutMs,
                timeoutMessage,
            }),
        });
    }

    return createCloneableSaga() as ResourceSaga<Klass, KW, Params, Data, Meta>;
}
