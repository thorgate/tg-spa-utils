import { article, comment, generateArticles, user } from '@thorgate/test-data';
import { ConfigureStore, configureStore } from '@thorgate/test-store';
import { normalize } from 'normalizr';
import { combineReducers } from 'redux';

import {
    entitiesActions,
    EntitiesMeta,
    EntitiesMetaDataMap,
    entitiesReducer,
    EntitiesRootState,
    entitiesSelectors,
    EntityStatus,
} from '../src';

const reducer = combineReducers({
    entities: entitiesReducer,
});

let store: ConfigureStore<EntitiesRootState>;

beforeEach(() => {
    store = configureStore(reducer);
});

type NormalizedData = ReturnType<typeof normalize>;

interface ExpectGlobalEntities {
    order?: any;
    archived?: any;
    entities?: any;
}

const expectGlobalEntities = (
    normalizedData: NormalizedData,
    expectedData: ExpectGlobalEntities = {}
) => {
    if (expectedData.order) {
        expect(entitiesSelectors.selectOrder(store.getState())).toEqual(
            expectedData.order
        );
    } else {
        expect(entitiesSelectors.selectOrder(store.getState())).toEqual({
            [article.key]: normalizedData.result,
        });
    }

    if (expectedData.archived) {
        expect(entitiesSelectors.selectArchived(store.getState())).toEqual(
            expectedData.archived
        );
    } else {
        expect(entitiesSelectors.selectArchived(store.getState())).toEqual({
            [article.key]: [],
        });
    }

    if (expectedData.entities) {
        expect(entitiesSelectors.selectEntities(store.getState())).toEqual(
            expectedData.entities
        );
    } else {
        expect(entitiesSelectors.selectEntities(store.getState())).toEqual(
            normalizedData.entities
        );
    }
};

interface ExpectEntities {
    order?: string[];
    archived?: string[];
    entities?: any;
}

const expectEntities = (
    normalizedData: NormalizedData,
    expectedData: ExpectEntities = {}
) => {
    if (expectedData.order) {
        expect(
            entitiesSelectors.selectEntityOrder(store.getState(), article.key)
        ).toEqual(expectedData.order);
    } else {
        expect(
            entitiesSelectors.selectEntityOrder(store.getState(), article.key)
        ).toEqual(normalizedData.result);
    }

    expect(
        entitiesSelectors.selectArchivedEntities(store.getState(), article.key)
    ).toEqual(expectedData.archived || []);

    if (expectedData.entities) {
        expect(
            entitiesSelectors.selectEntityType(store.getState(), article.key)
        ).toEqual(expectedData.entities);
    } else {
        expect(
            entitiesSelectors.selectEntityType(store.getState(), article.key)
        ).toEqual((normalizedData as any).entities[article.key]);
    }
};

const expectMetaData = (
    input: EntitiesMetaDataMap,
    result: EntitiesMetaDataMap,
    meta: EntitiesMeta = {}
) => {
    store.dispatch(
        entitiesActions.setEntitiesMetaData(
            {
                key: article.key,
                metaData: input,
            },
            meta
        )
    );

    expect(
        entitiesSelectors.selectEntitiesMetaData(store.getState(), article.key)
    ).toEqual(result);
};

describe('reducer works', () => {
    test('setEntities works w/ default meta args', () => {
        const normalizedData = normalize(generateArticles(5, 5), [article]);

        store.dispatch(
            entitiesActions.setEntitiesStatus({
                key: article.key,
                status: EntityStatus.Fetching,
            })
        );
        expect(
            entitiesSelectors.selectEntitiesStatus(
                store.getState(),
                article.key
            )
        ).toEqual(EntityStatus.Fetching);

        store.dispatch(
            entitiesActions.setEntities({
                key: article.key,
                entities: normalizedData.entities,
                order: normalizedData.result,
            })
        );

        store.dispatch(
            entitiesActions.setEntitiesStatus({
                key: article.key,
                status: EntityStatus.Fetched,
            })
        );
        expect(
            entitiesSelectors.selectEntitiesStatus(
                store.getState(),
                article.key
            )
        ).toEqual(EntityStatus.Fetched);

        // Expect entities to be created correctly
        expectGlobalEntities(normalizedData);
        expectEntities(normalizedData);
    });

    test('setEntities works w/ single entity', () => {
        const data = generateArticles(1, 5)[0];
        const normalizedData = normalize(data, article);

        store.dispatch(
            entitiesActions.setEntities({
                key: article.key,
                entities: normalizedData.entities,
                order: normalizedData.result,
            })
        );

        // Expect entities to be created correctly
        expectGlobalEntities(normalizedData, {
            order: {
                [article.key]: [normalizedData.result],
            },
        });
        expectEntities(normalizedData, { order: [normalizedData.result] });
    });

    test('setEntities works w/ mergeEntities', () => {
        const data = generateArticles(5, 5);
        const originalFirst = data[0];
        data[0] = {
            ...data[0],
            test: 1,
        };

        let normalizedData = normalize(data, [article]);
        const originalNormalized = normalizedData;

        store.dispatch(
            entitiesActions.setEntities({
                key: article.key,
                entities: normalizedData.entities,
                order: normalizedData.result,
            })
        );
        expectGlobalEntities(normalizedData);
        expectEntities(normalizedData);

        data[0] = originalFirst;
        normalizedData = normalize(data, [article]);
        store.dispatch(
            entitiesActions.setEntities(
                {
                    key: article.key,
                    entities: normalizedData.entities,
                    order: normalizedData.result,
                },
                { mergeEntities: true }
            )
        );
        expect(entitiesSelectors.selectEntities(store.getState())).toEqual(
            originalNormalized.entities
        );

        store.dispatch(
            entitiesActions.setEntities(
                {
                    key: article.key,
                    entities: normalizedData.entities,
                    order: normalizedData.result,
                },
                { mergeEntities: false }
            )
        );
        expect(entitiesSelectors.selectEntities(store.getState())).not.toEqual(
            originalNormalized.entities
        );

        expectGlobalEntities(normalizedData);
        expectEntities(normalizedData);
    });

    test('setEntities works w/ preserveExisting=false', () => {
        const data = generateArticles(5, 5);
        const originalFirst = data[0];
        data[0] = {
            ...data[0],
            test: 1,
        };

        let normalizedData = normalize(data, [article]);

        store.dispatch(
            entitiesActions.setEntities({
                key: article.key,
                entities: normalizedData.entities,
                order: normalizedData.result,
            })
        );
        expectEntities(normalizedData);

        // Let's restore original and check if data is valid
        data[0] = originalFirst;
        normalizedData = normalize(data, [article]);
        store.dispatch(
            entitiesActions.setEntities(
                {
                    key: article.key,
                    entities: normalizedData.entities,
                    order: normalizedData.result,
                },
                { preserveExisting: false }
            )
        );
        expectGlobalEntities(normalizedData);
        expectEntities(normalizedData);
    });

    test('setEntities works w/ updateOrder=true', () => {
        let data = generateArticles(15, 5);

        let normalizedData = normalize(data, [article]);
        const normalizedOriginal = normalizedData;

        store.dispatch(
            entitiesActions.setEntities({
                key: article.key,
                entities: normalizedData.entities,
                order: normalizedData.result,
            })
        );
        expectEntities(normalizedData);

        // Let's restore original and check if data is valid
        data = generateArticles(15, 5);
        normalizedData = normalize(data, [article]);
        store.dispatch(
            entitiesActions.setEntities(
                {
                    key: article.key,
                    entities: normalizedData.entities,
                    order: normalizedData.result,
                },
                { updateOrder: true }
            )
        );

        // And validate that update works correctly
        const existingMerged = {
            order: [...normalizedOriginal.result, ...normalizedData.result],
            entities: {
                ...normalizedData.entities[article.key],
                ...normalizedOriginal.entities[article.key],
            },
        };
        const existingGlobalMerged = {
            order: {
                [article.key]: [
                    ...normalizedOriginal.result,
                    ...normalizedData.result,
                ],
            },
            entities: {
                [article.key]: {
                    ...normalizedData.entities[article.key],
                    ...normalizedOriginal.entities[article.key],
                },
                [comment.key]: {
                    ...normalizedData.entities[comment.key],
                    ...normalizedOriginal.entities[comment.key],
                },
                [user.key]: {
                    ...normalizedData.entities[user.key],
                    ...normalizedOriginal.entities[user.key],
                },
            },
        };
        expectGlobalEntities(normalizedData, existingGlobalMerged);
        expectEntities(normalizedData, existingMerged);

        const singleData = generateArticles(1, 0)[0];
        normalizedData = normalize(singleData, article);
        store.dispatch(
            entitiesActions.setEntities(
                {
                    key: article.key,
                    entities: normalizedData.entities,
                    order: normalizedData.result,
                },
                { updateOrder: true }
            )
        );
        expectGlobalEntities(normalizedData, {
            order: {
                ...existingGlobalMerged.order,
                [article.key]: [
                    ...existingGlobalMerged.order[article.key],
                    normalizedData.result,
                ],
            },
            entities: {
                ...existingGlobalMerged.entities,
                [article.key]: {
                    ...existingGlobalMerged.entities[article.key],
                    ...normalizedData.entities[article.key],
                },
            },
        });
        expectEntities(normalizedData, {
            order: [...existingMerged.order, normalizedData.result],
            entities: {
                ...existingGlobalMerged.entities[article.key],
                ...normalizedData.entities[article.key],
            },
        });
    });

    test('setEntitiesMetaData works w/ default meta args', () => {
        expectMetaData(
            {
                a: 'test-value',
                b: {
                    c: 1,
                },
            },
            {
                a: 'test-value',
                b: {
                    c: 1,
                },
            }
        );
        expectMetaData(
            {
                a: 'new-value',
                b: {
                    c: 1,
                },
            },
            {
                a: 'new-value',
                b: {
                    c: 1,
                },
            }
        );
    });

    test('setEntitiesMetaData works w/ mergeMetadata', () => {
        expectMetaData(
            {
                a: {
                    b: 1,
                    c: '2',
                },
            },
            {
                a: {
                    b: 1,
                    c: '2',
                },
            },
            { mergeMetadata: true }
        );

        expectMetaData(
            {
                a: {
                    c: '3',
                    d: '4',
                },
            },
            {
                a: {
                    b: 1,
                    c: '3',
                    d: '4',
                },
            },
            { mergeMetadata: true }
        );
    });

    test('setEntitiesMetaData works w/ preserveExisting=false', () => {
        expectMetaData(
            {
                a: {
                    b: 1,
                    c: '2',
                },
                b: [1],
                c: 1,
            },
            {
                a: {
                    b: 1,
                    c: '2',
                },
                b: [1],
                c: 1,
            },
            { preserveExisting: false }
        );

        expectMetaData(
            {
                a: {
                    c: '3',
                    d: '4',
                },
                b: [2],
            },
            {
                a: {
                    c: '3',
                    d: '4',
                },
                b: [2],
            },
            { preserveExisting: false }
        );
    });

    test('archive flow works', () => {
        const data = generateArticles(5, 5);

        const firstId = data[0].id;

        const normalizedData = normalize(data, [article]);

        // expect initial data to be correct
        store.dispatch(
            entitiesActions.setEntities({
                key: article.key,
                entities: normalizedData.entities,
                order: normalizedData.result,
            })
        );
        expectGlobalEntities(normalizedData);
        expectEntities(normalizedData);

        // Expect archive to work
        store.dispatch(
            entitiesActions.markArchived({ key: article.key, ids: [firstId] })
        );
        expectGlobalEntities(normalizedData, {
            archived: {
                [article.key]: [firstId],
            },
        });
        expectEntities(normalizedData, { archived: [firstId] });

        // Expect markActive to restore
        store.dispatch(
            entitiesActions.markActive({ key: article.key, ids: [firstId] })
        );
        expectGlobalEntities(normalizedData);
        expectEntities(normalizedData);

        store.dispatch(
            entitiesActions.markArchived({ key: article.key, ids: [firstId] })
        );
        store.dispatch(
            entitiesActions.setEntities(
                {
                    key: article.key,
                    entities: normalizedData.entities,
                    order: normalizedData.result,
                },
                { clearArchived: false }
            )
        );
        expectGlobalEntities(normalizedData, {
            archived: {
                [article.key]: [firstId],
            },
        });
        expectEntities(normalizedData, { archived: [firstId] });
    });

    test('purgeEntities works', () => {
        const data = generateArticles(5, 5);

        const firstId = data[0].id;
        const commentIds = data[0].comments.map((c) => c.id);
        const withoutFirst = data.filter((d) => d.id !== firstId);

        let normalizedData = normalize(data, [article]);

        // expect initial data to be correct
        store.dispatch(
            entitiesActions.setEntities({
                key: article.key,
                entities: normalizedData.entities,
                order: normalizedData.result,
            })
        );
        expectGlobalEntities(normalizedData);
        expectEntities(normalizedData);

        // Expect purge to work
        store.dispatch(
            entitiesActions.purgeEntities({ key: article.key, ids: ['asd'] })
        );
        store.dispatch(
            entitiesActions.purgeEntities({ key: article.key, ids: [firstId] })
        );
        store.dispatch(
            entitiesActions.purgeEntities({ key: comment.key, ids: commentIds })
        );
        normalizedData = normalize(withoutFirst, [article]);
        expectGlobalEntities(normalizedData, {
            order: {
                [article.key]: normalizedData.result,
                [comment.key]: [],
            },
        });
        expectEntities(normalizedData);
    });

    test('purgeOrder works', () => {
        const data = generateArticles(5, 5);

        // const firstId = data[0].id;

        const normalizedData = normalize(data, [article]);

        // expect initial data to be correct
        store.dispatch(
            entitiesActions.setEntities({
                key: article.key,
                entities: normalizedData.entities,
                order: normalizedData.result,
            })
        );
        expectGlobalEntities(normalizedData);
        expectEntities(normalizedData);

        // Expect purge to work
        store.dispatch(entitiesActions.purgeOrder({ key: article.key }));
        expectGlobalEntities(normalizedData, {
            order: {
                [article.key]: [],
            },
        });
        expectEntities(normalizedData, {
            order: [],
        });
    });

    test('clearEntities works', () => {
        const normalizedData = normalize(generateArticles(5, 5), [article]);

        store.dispatch(
            entitiesActions.setEntities({
                key: article.key,
                entities: normalizedData.entities,
                order: normalizedData.result,
            })
        );
        expectGlobalEntities(normalizedData);
        expectEntities(normalizedData);

        store.dispatch(entitiesActions.clearEntities());

        expect(entitiesSelectors.selectEntitiesRoot(store.getState())).toEqual({
            order: {},
            data: {},
            archived: {},
            status: {},
            metaData: {},
        });
    });
});
