import { SagaResource } from '@tg-resources/redux-saga-router';
import { getError } from '@thorgate/spa-errors';
import { DummyResource } from '@thorgate/test-resource';
import { ConfigureStore, configureStore } from '@thorgate/test-store';
import { delay } from 'redux-saga/effects';

import {
    createFetchAction,
    createFetchSaga,
    createSchemaSelector,
    entitiesSelectors,
    EntityStatus,
    FetchMeta,
    FetchSaga,
} from '../src';
import { article, generateArticles } from './createTestData';
import { reducer, State } from './reducer';


let store: ConfigureStore<State>;

beforeEach(() => {
    store = configureStore(reducer);
});

const actionCreator = createFetchAction('TEST_DATA');

const expectResponse = async (
    fetchSaga: FetchSaga<any, any, any, any, any>,
    schemaSelector: ReturnType<typeof createSchemaSelector>,
    payload: any = {},
    meta: FetchMeta = {},
    data?: any
) => {
    await store.sagaMiddleware.run(fetchSaga, null, actionCreator(payload, meta)).toPromise();

    if (data) {
        expect(getError(store.getState())).toEqual(null);
        expect(schemaSelector(store.getState())).toEqual(data);
    }
};

describe('createFetchSaga works', () => {
    test('missing effect or hook', async () => {
        const schemaSelector = createSchemaSelector(article);

        const fetchSaga = createFetchSaga({
            key: article.key,
            listSchema: [article],
        });

        await expectResponse(fetchSaga, schemaSelector);
        expect(getError(store.getState())!.message)
            .toEqual('Misconfiguration: "resource" or "apiFetchHook" is required');
    });

    test('with SagaResource', async () => {
        const schemaSelector = createSchemaSelector(article);
        const resource = new SagaResource('/test', null, DummyResource);
        const data = generateArticles(100, 5);
        resource.resource.Data = data;

        const callback = jest.fn();

        const fetchSaga = createFetchSaga({
            resource,
            key: article.key,
            listSchema: [article],
        });

        await expectResponse(fetchSaga, schemaSelector, {}, { callback }, data);

        expect(callback.mock.calls.length).toEqual(1);

        expect(entitiesSelectors.selectEntitiesStatus(store.getState(), article.key)).toEqual(EntityStatus.Fetched);

        // Empty clone does not mutate original with no arguments
        await expectResponse(fetchSaga.cloneSaga(), schemaSelector, {}, { callback }, data);

        expect(callback.mock.calls.length).toEqual(2);

        expect(entitiesSelectors.selectStatuses(store.getState())).toEqual({
            [article.key]: EntityStatus.Fetched,
        });
    });

    test('with SagaResource as details', async () => {
        const schemaSelector = createSchemaSelector(article);
        const resource = new SagaResource('/test', null, DummyResource);
        const data = generateArticles(100, 5);
        resource.resource.Data = data;

        const callback = jest.fn();

        const fetchSaga = createFetchSaga({
            resource,
            key: article.key,
            listSchema: [article],
        });

        await expectResponse(fetchSaga, schemaSelector, {}, { callback }, data);

        expect(callback.mock.calls.length).toEqual(1);

        const firstArticle = {
            ...data[0],

            title: 'Updated title',
        };

        resource.resource.Data = firstArticle;

        await expectResponse(
            fetchSaga, schemaSelector, {}, { callback, asDetails: true }, [firstArticle, ...data.slice(1)],
        );
    });

    test('saveMany', async () => {
        const schemaSelector = createSchemaSelector(article);
        const data = generateArticles(100, 5);

        const resource = new SagaResource('/test', null, DummyResource);
        resource.resource.Data = data;

        const fetchSaga = createFetchSaga({
            resource,
            key: article.key,
            listSchema: [article],
        });

        await store.sagaMiddleware.run(fetchSaga.saveMany, data);
        expect(schemaSelector(store.getState())).toEqual(data);
    });

    test('saveMany w/ single entity update', async () => {
        const schemaSelector = createSchemaSelector(article);
        const data = generateArticles(100, 5);

        const resource = new SagaResource('/test', null, DummyResource);
        resource.resource.Data = data;

        const fetchSaga = createFetchSaga({
            resource,
            key: article.key,
            listSchema: [article],
        });

        await store.sagaMiddleware.run(fetchSaga.saveMany, data);
        expect(schemaSelector(store.getState())).toEqual(data);

        const firstArticle = {
            ...data[0],

            title: 'Updated title',
        };

        await store.sagaMiddleware.run(fetchSaga.save, firstArticle);
        expect(schemaSelector(store.getState())).toEqual([firstArticle, ...data.slice(1)]);

        resource.resource.Data = data[0];
        await expectResponse(
            fetchSaga.cloneSaga({
                mutateResponse: (res: any) => [res],
            }), schemaSelector, {}, {}, [data[0]],
        );
    });

    test('with Resource', async () => {
        const schemaSelector = createSchemaSelector(article);
        const resource = new SagaResource('/test', null, DummyResource);
        const data = generateArticles(100, 5);
        resource.resource.Data = data;

        const callback = jest.fn();

        const fetchSaga = createFetchSaga({
            resource: resource.resource,
            key: article.key,
            listSchema: [article],
        });

        await expectResponse(fetchSaga, schemaSelector, {}, { callback }, data);

        expect(callback.mock.calls.length).toEqual(1);
    });

    test('with successHook', async () => {
        const schemaSelector = createSchemaSelector(article);
        const resource = new SagaResource('/test', null, DummyResource);
        const data = generateArticles(100, 5);
        resource.resource.Data = data;

        function successHook(result: any, _0: any, _1: any) {
            expect(result).toEqual(data);
        }

        const fetchSaga = createFetchSaga({
            key: article.key,
            listSchema: [article],
            resource,
            successHook,
        });

        await expectResponse(fetchSaga, schemaSelector, {}, { callback: 123 as any }, data);
    });

    test('with apiFetchHook', async () => {
        const schemaSelector = createSchemaSelector(article);
        const data = generateArticles(100, 5);

        function apiFetchHook() {
            return data;
        }

        const fetchSaga = createFetchSaga({
            key: article.key,
            listSchema: [article],
            apiFetchHook,
        });

        await expectResponse(fetchSaga, schemaSelector, {}, { callback: 123 as any }, data);
    });

    test('timeout handling', async () => {
        const schemaSelector = createSchemaSelector(article);

        function* apiFetchHook() {
            yield delay(1000);
        }

        const fetchSaga = createFetchSaga({
            apiFetchHook,
            key: article.key,
            listSchema: [article],
            timeoutMs: 10,
        });

        await expectResponse(fetchSaga, schemaSelector);

        const error = getError(store.getState());
        expect(error && error.message).toEqual('TimeoutError: NormalizedFetch saga timed out for key: articles');
    });

    test('error handling', async () => {
        const schemaSelector = createSchemaSelector(article);
        const resource = new SagaResource('/test', null, DummyResource);
        resource.resource.Error = new Error();

        const fetchSaga = createFetchSaga({
            resource,
            key: article.key,
            listSchema: [article],
        });

        await expectResponse(fetchSaga, schemaSelector);

        const error = getError(store.getState());
        expect(error && error.message).toEqual('NetworkError');
    });

    test('initial worker wrong config', () => {
        const resource = new SagaResource('/test', null, DummyResource);
        resource.resource.Error = new Error();

        const fetchSaga = createFetchSaga({
            resource,
            key: article.key,
            listSchema: [article],
        });

        expect(() => {
            fetchSaga.asInitialWorker('asd' as any);
        }).toThrow(/Parameter "initialAction" is required for "asInitialWorker"./);
    });

    test('initial worker w/ error handling', (done) => {
        const resource = new SagaResource('/test', null, DummyResource);
        resource.resource.Error = new Error();

        const fetchSaga = createFetchSaga({
            resource,
            key: article.key,
            listSchema: [article],
        }).asInitialWorker(() => actionCreator({}));

        store.sagaMiddleware.run(fetchSaga, null).toPromise()
            .then(() => done(new Error('Should throw')))
            .catch((err: any) => {
                expect(err.toString()).toEqual('NetworkError');
                done();
            });
    });
});
