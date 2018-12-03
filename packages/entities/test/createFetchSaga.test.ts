import { SagaResource } from '@tg-resources/redux-saga-router';
import { getError } from '@thorgate/spa-errors';
import { DummyResource } from '@thorgate/test-resource';
import { delay } from 'redux-saga/effects';

import { createFetchAction, createFetchSaga, createSchemaSelector } from '../src';
import { configureStore } from './createStore';
import { article, generateArticles } from './createTestData';


let store: ReturnType<typeof configureStore>;

beforeEach(() => {
    store = configureStore();
});

const actionCreator = createFetchAction('TEST_DATA');

const expectResponse = async (
    fetchSaga: ReturnType<typeof createFetchSaga>,
    schemaSelector: ReturnType<typeof createSchemaSelector>,
    payload: any = {},
    data?: any
) => {
    await store.runSaga(fetchSaga, actionCreator(payload)).toPromise();

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
            .toEqual('Misconfiguration: "resource" or "apiFetchHook" is required for "articles"');
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

        await expectResponse(fetchSaga, schemaSelector, { callback }, data);

        expect(callback.mock.calls.length).toEqual(1);
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

        await expectResponse(fetchSaga, schemaSelector, { callback }, data);

        expect(callback.mock.calls.length).toEqual(1);
    });

    test('with apiFetchHook', async () => {
        const schemaSelector = createSchemaSelector(article);
        const data = generateArticles(100, 5);

        function apiFetchHook() {
            return {
                results: data,
            };
        }

        const fetchSaga = createFetchSaga({
            key: article.key,
            listSchema: [article],
            apiFetchHook,
        });

        await expectResponse(fetchSaga, schemaSelector, { callback: 123 }, data);
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

        expect(getError(store.getState())!.message).toEqual('TimeoutError: NormalizedFetch saga timed out for key: articles');
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

        expect(getError(store.getState())!.message).toEqual('NetworkError');
    });
});
