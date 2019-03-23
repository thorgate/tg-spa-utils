import { SagaResource } from '@tg-resources/redux-saga-router';
import { createFetchAction, createFetchSaga } from '@thorgate/spa-entities';
import { entitiesReducer, EntitiesRootState } from '@thorgate/spa-entities-reducer';
import { errorReducer, ErrorState } from '@thorgate/spa-errors';
import { paginationReducer, paginationSelectors, PaginationState } from '@thorgate/spa-pagination-reducer';
import { article, generateArticles } from '@thorgate/test-data';
import { DummyResource } from '@thorgate/test-resource';
import { ConfigureStore, configureStore } from '@thorgate/test-store';
import { combineReducers } from 'redux';

import { createPaginationSuccessHook } from '../src';


interface State extends ErrorState, EntitiesRootState, PaginationState {
}

const reducer = combineReducers({
    entities: entitiesReducer,
    error: errorReducer,
    pagination: paginationReducer,
});

let store: ConfigureStore<State>;

beforeEach(() => {
    store = configureStore(reducer);
});

const actionCreator = createFetchAction('TEST_DATA');

const setupData = async (key: string, ...args: any[]) => {
    const resource = new SagaResource('/test', null, DummyResource);
    const data = generateArticles(100, 5);
    resource.resource.Data = {
        next: { page: '2', test: '1' },
        previous: { page: '1', test: '1' },
        result: data,
    };

    const fetchSaga = createFetchSaga({
        resource,
        key: article.key,
        listSchema: [article],
        successHook: createPaginationSuccessHook(key, ...args),
    });

    await store.sagaMiddleware.run(fetchSaga, null, actionCreator({ query: { test: '1' } })).toPromise();
};


describe('createSuccessHook', () => {
    test('query is stored to store', async () => {
        await setupData('test');

        // Expect store values
        expect(paginationSelectors.selectNextKwargs(store.getState(), 'test')).toEqual({ page: '2', test: '1' });
        expect(paginationSelectors.selectCurrentKwargs(store.getState(), 'test')).toEqual({ test: '1' });
        expect(paginationSelectors.selectPrevKwargs(store.getState(), 'test')).toEqual({ page: '1', test: '1' });
        expect(paginationSelectors.selectHasNext(store.getState(), 'test')).toEqual(true);
        expect(paginationSelectors.selectHasPrev(store.getState(), 'test')).toEqual(true);
    });

    test('setNextOnly works', async () => {
        await setupData('test', true);

        // Expect store values
        expect(paginationSelectors.selectNextKwargs(store.getState(), 'test')).toEqual({ page: '2', test: '1' });
        expect(paginationSelectors.selectCurrentKwargs(store.getState(), 'test')).toEqual(null);
        expect(paginationSelectors.selectPrevKwargs(store.getState(), 'test')).toEqual(null);
        expect(paginationSelectors.selectHasNext(store.getState(), 'test')).toEqual(true);
        expect(paginationSelectors.selectHasPrev(store.getState(), 'test')).toEqual(false);
    });

    test('enabled works', async () => {
        await setupData('test', true, false);

        // Expect store values
        expect(paginationSelectors.selectNextKwargs(store.getState(), 'test')).toEqual(null);
        expect(paginationSelectors.selectCurrentKwargs(store.getState(), 'test')).toEqual(null);
        expect(paginationSelectors.selectPrevKwargs(store.getState(), 'test')).toEqual(null);
        expect(paginationSelectors.selectHasNext(store.getState(), 'test')).toEqual(false);
        expect(paginationSelectors.selectHasPrev(store.getState(), 'test')).toEqual(false);
    });
});

