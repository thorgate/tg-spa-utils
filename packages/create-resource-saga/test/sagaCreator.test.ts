import { SagaResource } from '@tg-resources/redux-saga-router';
import { DummyResource } from '@thorgate/test-resource';
import { ConfigureStore, configureStore } from '@thorgate/test-store';
import { delay } from 'redux-saga/effects';

import { createResourceSaga } from '../src';
import { actions, actionTypeNoMeta, resourceType } from './utils';


let store: ConfigureStore<any>;
let resource: SagaResource<DummyResource>;
const actionPayload = { kwargs: { pk: 1 }, query: { test: 1 } };

beforeEach(() => {
    store = configureStore((state: any, _0: any) => {
        return state;
    });

    resource = new SagaResource('/test', null, DummyResource);
});


describe('createResourceSaga', () => {
    test('wrong action type', async (done) => {
        const saga = createResourceSaga({});

        try {
            await store.sagaMiddleware.run(saga, null, {} as any).toPromise();

            done(new Error('Expected to fail for in-correct action type'));
        } catch (error) {
            expect(error.toString()).toEqual('Error: Action (property "type") is missing');
            done();
        }
    });

    test('wrong configuration', async (done) => {
        const saga = createResourceSaga({});

        try {
            await store.sagaMiddleware.run(saga, null, actions.noMeta()).toPromise();

            done(new Error('Expected to fail for missing "resource" and "apiHook".'));
        } catch (error) {
            expect(error.toString()).toEqual('Error: Misconfiguration: "resource" or "apiFetchHook" is required');
            done();
        }
    });

    test('request timeout', async (done) => {
        const saga = createResourceSaga({
            * apiHook() {
                yield delay(500);

                done(new Error('Expected Saga to be cancelled via timeout.'));
            },
            timeoutMessage: 'Timeout error',
            timeoutMs: 10,
        });

        try {
            await store.sagaMiddleware.run(saga, null, actions.noMeta()).toPromise();

            done(new Error('Expected Saga to be cancelled via timeout.'));
        } catch (error) {
            expect(error.toString()).toEqual('Error: Timeout error');
            done();
        }
    });

    test('cloneSaga', () => {
        const saga = createResourceSaga({
            resource,
        });

        expect(saga.getConfiguration().resource).toBe(resource);

        // Empty clone keeps original configuration
        expect(saga.cloneSaga({}).getConfiguration()).toEqual(saga.getConfiguration());

        // Clone replaces resource
        expect(saga.cloneSaga({ resource: resource.resource }).getConfiguration().resource).toBe(resource.resource);
    });

    test('mutateKwargs', async () => {
        const mutateKwargs = jest.fn();

        const saga = createResourceSaga({
            resource,
            mutateKwargs,
        });

        await store.sagaMiddleware.run(saga, null, actions.noMeta(actionPayload)).toPromise();

        expect(mutateKwargs.mock.calls).toEqual([
            [null, {
                type: actionTypeNoMeta,
                resourceType,
                payload: actionPayload,
                meta: undefined,
            }],
        ]);
    });

    test('mutateQuery', async () => {
        const mutateQuery = jest.fn();

        const saga = createResourceSaga({
            resource,
            mutateQuery,
        });

        await store.sagaMiddleware.run(saga, null, actions.noMeta(actionPayload)).toPromise();

        expect(mutateQuery.mock.calls).toEqual([
            [null, {
                type: actionTypeNoMeta,
                resourceType,
                payload: actionPayload,
                meta: undefined,
            }],
        ]);
    });

    test('apiHook', async () => {
        const apiHook = jest.fn();

        const saga = createResourceSaga({
            apiHook,
        });

        await store.sagaMiddleware.run(saga, null, actions.noMeta(actionPayload)).toPromise();

        expect(apiHook.mock.calls).toEqual([
            [null, {
                type: actionTypeNoMeta,
                resourceType,
                payload: actionPayload,
                meta: undefined,
            }],
        ]);
    });


    test('successHook', async () => {
        const mutateKwargs = jest.fn();
        const mutateQuery = jest.fn();
        const successHook = jest.fn();

        const saga = createResourceSaga({
            resource,
            mutateKwargs,
            mutateQuery,
            successHook,
        });

        await store.sagaMiddleware.run(saga, null, actions.noMeta(actionPayload)).toPromise();

        expect(mutateKwargs.mock.calls).toEqual([
            [null, {
                type: actionTypeNoMeta,
                resourceType,
                payload: actionPayload,
                meta: undefined,
            }],
        ]);

        expect(mutateQuery.mock.calls).toEqual([
            [null, {
                type: actionTypeNoMeta,
                resourceType,
                payload: actionPayload,
                meta: undefined,
            }],
        ]);

        expect(successHook.mock.calls).toEqual([
            [null, null, {
                type: actionTypeNoMeta,
                resourceType,
                payload: actionPayload,
                meta: undefined,
            }],
        ]);
    });
});
