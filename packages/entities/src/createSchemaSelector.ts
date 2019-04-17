import { EntitiesData, EntitiesRootState, entitiesSelectors } from '@thorgate/spa-entities-reducer';
import { isFunction } from '@thorgate/spa-is';
import { denormalize, schema } from 'normalizr';

import {
    DetailSchemaSelector,
    Key,
    KeyFn,
    KeyOptions,
    ListKeyOptionsSchemaSelector,
    ListSchemaSelector,
} from './types';
import { GetKeyValue } from './utils';


export function createSchemaSelector<
    RType = any
>(entitySchema: schema.Entity, key?: string): ListSchemaSelector<RType>;
export function createSchemaSelector<
    RType = any
>(entitySchema: schema.Entity, key?: KeyFn): ListKeyOptionsSchemaSelector<RType>;

/**
 * Create entity list memoized selector.
 *  If empty list is used, default order from matching entity is returned
 *
 *  Memoization is based on previously used id and entities storage
 *
 * @param entitySchema
 * @param key
 */
export function createSchemaSelector<RType = any>(entitySchema: schema.Entity, key: Key = entitySchema.key) {
    let prevIds: Array<string | number> = [];
    let prevArchived: Array<string | number> = [];
    let prevEntities: EntitiesData;
    let result: RType[] = [];

    function baseSelector<S extends EntitiesRootState>(state: S, ids: Array<string | number> = [], keyValue: string): RType[] {
        let selectedIds: Array<string | number>;

        if (ids.length) {
            selectedIds = ids;
        } else {
            selectedIds = entitiesSelectors.selectEntityOrder(state, keyValue);
        }

        const archived: Array<string | number> = entitiesSelectors.selectArchivedEntities(state, keyValue);
        const entities = entitiesSelectors.selectEntities(state);

        if (selectedIds === prevIds && archived === prevArchived && prevEntities === entities && result.length) {
            return result;
        }

        prevIds = selectedIds;
        prevArchived = archived;
        prevEntities = entities;

        // Return empty array if entity specified with key does not exist
        if (!entities[entitySchema.key]) {
            return [];
        }

        result = denormalize(
            selectedIds.filter((id) => !archived.includes(id)),
            [entitySchema],
            entities,
        ) as RType[];

        return result;
    }

    if (isFunction(key)) {
        return <S extends EntitiesRootState>(state: S, keyOptions: KeyOptions | null, ids: Array<string | number> = []): RType[] => {
            const keyValue = GetKeyValue(key, keyOptions);
            return baseSelector(state, ids, keyValue);
        };
    }

    return <S extends EntitiesRootState>(state: S, ids: Array<string | number> = []): RType[] => {
        return baseSelector(state, ids, key);
    };
}


export function createDetailSchemaSelector<
    RType = any
>(entitySchema: schema.Entity): DetailSchemaSelector<RType>;


/**
 * Create single entity memoized selector
 *
 *  Memoization is based on previously used id and entities storage
 *
 * @param entitySchema
 */
export function createDetailSchemaSelector<RType = any>(entitySchema: schema.Entity) {
    let prevId: string | number;
    let prevEntities: EntitiesData;
    let result: RType | null = null;

    return <S extends EntitiesRootState>(state: S, id: string | number): RType | null => {
        const selectId: string | number = id;

        const entities = entitiesSelectors.selectEntities(state);

        // If entities have not been updated, we can assume that data is still the same
        if (prevId === selectId && prevEntities === entities && result) {
            return result;
        }

        prevId = selectId;
        prevEntities = entities;

        // Return null if entity specified with key or id does not exist
        if (!entities[entitySchema.key] || !((entities[entitySchema.key] || {})[selectId])) {
            return null;
        }

        result = denormalize(selectId, entitySchema, entities) as RType;
        return result;
    };
}
