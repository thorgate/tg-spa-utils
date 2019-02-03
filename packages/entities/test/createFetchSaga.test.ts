import { SagaResource } from '@tg-resources/redux-saga-router';
import { getError } from '@thorgate/spa-errors';
import { DummyResource } from '@thorgate/test-resource';
import { ConfigureStore, configureStore } from '@thorgate/test-store';
import { delay } from 'redux-saga/effects';

import {
    createFetchAction,
    createFetchSaga,
    createSchemaSelector,
    FetchMeta,
    saveResult,
    saveResults
} from '../src';
import { article, generateArticles } from './createTestData';
import { reducer, State } from './reducer';


let store: ConfigureStore<State>;

beforeEach(() => {
    store = configureStore(reducer);
});

const actionCreator = createFetchAction('TEST_DATA');

const expectResponse = async (
    fetchSaga: ReturnType<typeof createFetchSaga>,
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

    test('saveResults', async () => {
        const schemaSelector = createSchemaSelector(article);
        const data = generateArticles(100, 5);

        await store.sagaMiddleware.run(saveResults, article.key, data, [article]);
        expect(schemaSelector(store.getState())).toEqual(data);
    });

    test('saveResults w/ update', async () => {
        const schemaSelector = createSchemaSelector(article);
        const data = generateArticles(100, 5);

        await store.sagaMiddleware.run(saveResults, article.key, data, [article]);
        expect(schemaSelector(store.getState())).toEqual(data);

        const firstArticle = {
            ...data[0],

            title: 'Updated title',
        };

        await store.sagaMiddleware.run(saveResult, article.key, firstArticle, article);
        expect(schemaSelector(store.getState())).toEqual([firstArticle, ...data.slice(1)]);
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
});
