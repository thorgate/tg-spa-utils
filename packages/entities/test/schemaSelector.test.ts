import { article, comment, generateArticles, generateComments, user } from '@thorgate/test-data';
import { ConfigureStore, configureStore } from '@thorgate/test-store';
import * as normalizr from 'normalizr';

import {
    createDetailSchemaSelector,
    createSchemaSelector,
    entitiesActions,
} from '../src';

import { reducer, State } from './reducer';


let store: ConfigureStore<State>;

beforeEach(() => {
    store = configureStore(reducer);
});


const pushDataToStore = (schema: any, data: any) => {
    const normalizedData = normalizr.normalize(data, [schema]);

    store.dispatch(entitiesActions.setEntities({
        key: schema.key,
        entities: normalizedData.entities,
        order: normalizedData.result,
    }));
};


// TODO: mock with real implementation `denormalize` and inspect that it is not called second time
describe('createSchemaSelector works', () => {
    test('root schema selector works', () => {
        const schemaSelector = createSchemaSelector(article, article.key, { max: Infinity });

        const data = generateArticles(15, 15);
        pushDataToStore(article, data);

        const result = schemaSelector(store.getState());
        expect(schemaSelector(store.getState())).toEqual(data);
        expect(schemaSelector(store.getState())).toStrictEqual(result);

        // Reset cache
        pushDataToStore(article, data);

    });

    test('specific ids w/ archive', () => {
        const schemaSelector = createSchemaSelector(comment, comment.key, { max: Infinity });

        const data = generateComments(15);
        pushDataToStore(comment, data);

        const ids = data.map((d) => d.id);

        const originalResult = schemaSelector(store.getState(), ids);

        const [skip, ...active] = ids;

        expect(schemaSelector(store.getState(), ids)).toEqual(data);
        expect(schemaSelector(store.getState(), ids)).toStrictEqual(originalResult);

        store.dispatch(entitiesActions.markArchived({ key: comment.key, ids: [skip] }));

        const result = schemaSelector(store.getState(), ids);
        expect(schemaSelector(store.getState(), ids)).not.toEqual(data);
        expect(schemaSelector(store.getState(), ids)).toStrictEqual(data.filter((d) => active.includes(d.id)));
        expect(schemaSelector(store.getState(), ids)).toBe(result);
    });

    test('detail selector works', () => {
        const schemaSelector = createDetailSchemaSelector(article, { max: Infinity });

        const data = generateArticles(15, 15);
        pushDataToStore(article, data);

        const results = data.map((expected) => {
            const result = schemaSelector(store.getState(), expected.id);
            expect(schemaSelector(store.getState(), expected.id)).toStrictEqual(expected);

            // This should not call `denormalize` again, we should have same result as previous call
            expect(schemaSelector(store.getState(), expected.id)).toBe(result);

            return result;
        });

        expect(schemaSelector(store.getState(), '-missing-')).toBeNull();

        data.forEach(({ id }, idx) => {
            expect(schemaSelector(store.getState(), id)).toStrictEqual(results[idx]);
            expect(schemaSelector(store.getState(), id)).toBe(results[idx]);
        });

        schemaSelector.invalidate();

        // Invalidated selector should not match anymore
        data.forEach(({ id }, idx) => {
            // Content should match
            expect(schemaSelector(store.getState(), id)).toStrictEqual(results[idx]);

            // But should be new instance
            expect(schemaSelector(store.getState(), id)).not.toBe(results[idx]);
        });

        expect(schemaSelector(store.getState(), '-missing-')).toBeNull();
    });

    test('detail selector ignores archived', () => {
        const schemaSelector = createDetailSchemaSelector(comment, { max: Infinity });

        const data = generateComments(15);
        pushDataToStore(comment, data);

        data.forEach((expectedData) => {
            const result = schemaSelector(store.getState(), expectedData.id);
            expect(schemaSelector(store.getState(), expectedData.id)).toStrictEqual(expectedData);

            store.dispatch(entitiesActions.markArchived({ key: comment.key, ids: [expectedData.id] }));

            // This should not call `denormalize` again, we should have same result as previous call
            expect(schemaSelector(store.getState(), expectedData.id)).toBe(result);
        });
    });

    test('list :: missing key returns empty', () => {
        const schemaSelector = createSchemaSelector(user, user.key);
        expect(schemaSelector(store.getState())).toEqual([]);
    });

    test('detail :: missing key returns null', () => {
        const schemaSelector = createDetailSchemaSelector(user);
        expect(schemaSelector(store.getState(), 1)).toBeNull();
    });
});
