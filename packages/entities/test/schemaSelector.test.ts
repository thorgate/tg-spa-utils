import { ConfigureStore, configureStore } from '@thorgate/test-store';
import { normalize } from 'normalizr';

import {
    createSchemaSelector,
    entitiesActions,
} from '../src';

import { article, comment, generateArticles, generateComments, user } from './createTestData';
import { reducer, State } from './reducer';


let store: ConfigureStore<State>;

beforeEach(() => {
    store = configureStore(reducer);
});


const pushDataToStore = (schema: any, data: any) => {
    const normalizedData = normalize(data, [schema]);

    store.dispatch(entitiesActions.setEntities({
        key: schema.key,
        entities: normalizedData.entities,
        order: normalizedData.result,
    }));
};


describe('createSchemaSelector works', () => {
    test('root schema selector works', () => {
        const schemaSelector = createSchemaSelector(article);

        const data = generateArticles(15, 15);
        pushDataToStore(article, data);

        expect(schemaSelector(store.getState())).toEqual(data);
    });

    test('specific ids w/ archive', () => {
        const schemaSelector = createSchemaSelector(comment);

        const data = generateComments(15);
        pushDataToStore(comment, data);

        const ids = data.map((d) => d.id);

        const [skip, ...active] = ids;

        expect(schemaSelector(store.getState(), ...ids)).toEqual(data);

        store.dispatch(entitiesActions.markArchived({ key: comment.key, ids: [skip] }));

        expect(schemaSelector(store.getState(), ...ids)).toEqual(data.filter((d) => active.includes(d.id)));
    });

    test('missing key returns empty', () => {
        const schemaSelector = createSchemaSelector(user);

        expect(schemaSelector(store.getState())).toEqual([]);
    });
});
