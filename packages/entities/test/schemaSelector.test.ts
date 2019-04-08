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
        const schemaSelector = createSchemaSelector(article, article.key);

        const data = generateArticles(15, 15);
        pushDataToStore(article, data);

        const result = schemaSelector(store.getState());
        expect(schemaSelector(store.getState())).toEqual(data);
        expect(schemaSelector(store.getState())).toStrictEqual(result);
    });

    test('specific ids w/ archive', () => {
        const schemaSelector = createSchemaSelector(comment, comment.key);

        const data = generateComments(15);
        pushDataToStore(comment, data);

        const ids = data.map((d) => d.id);

        const [skip, ...active] = ids;

        expect(schemaSelector(store.getState(), ids)).toEqual(data);

        store.dispatch(entitiesActions.markArchived({ key: comment.key, ids: [skip] }));

        const result = schemaSelector(store.getState(), ids);
        expect(schemaSelector(store.getState(), ids)).toEqual(data.filter((d) => active.includes(d.id)));
        expect(schemaSelector(store.getState(), ids)).toStrictEqual(result);
    });

    test('detail selector works', () => {
        const schemaSelector = createDetailSchemaSelector(article, article.key);

        const data = generateArticles(15, 15);
        pushDataToStore(article, data);

        const result = schemaSelector(store.getState(), data[0].id);
        expect(schemaSelector(store.getState(), data[0].id)).toEqual(data[0]);

        // This should not call `denormalize` again, we should have same result as previous call
        expect(schemaSelector(store.getState(), data[0].id)).toStrictEqual(result);
    });

    test('detail selector ignores archived', () => {
        const schemaSelector = createDetailSchemaSelector(comment, comment.key);

        const data = generateComments(15);
        pushDataToStore(comment, data);

        const ids = data.map((d) => d.id);

        const [id] = ids;
        const [expectedData] = data;

        const result = schemaSelector(store.getState(), id);
        expect(schemaSelector(store.getState(), id)).toEqual(expectedData);

        store.dispatch(entitiesActions.markArchived({ key: comment.key, ids: [id] }));

        // This should not call `denormalize` again, we should have same result as previous call
        expect(schemaSelector(store.getState(), id)).toStrictEqual(result);
    });

    test('list :: missing key returns empty', () => {
        const schemaSelector = createSchemaSelector(user, user.key);

        expect(schemaSelector(store.getState())).toEqual([]);
    });

    test('detail :: missing key returns null', () => {
        const schemaSelector = createDetailSchemaSelector(user, user.key);

        expect(schemaSelector(store.getState(), 1)).toEqual(null);
    });
});
