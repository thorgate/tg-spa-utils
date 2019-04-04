import { EntitiesData, EntitiesRootState, entitiesSelectors } from '@thorgate/spa-entities-reducer';
import { isFunction } from '@thorgate/spa-is';
import { denormalize, schema } from 'normalizr';
import { match } from 'react-router';

import { DetailMatchSchemaSelector, DetailSchemaSelector, Key, KeyFn, ListMatchSchemaSelector, ListSchemaSelector } from './types';
import { GetKeyValue } from './utils';


export function createSchemaSelector<RType = any>(entitySchema: schema.Entity, key?: KeyFn<any>): ListMatchSchemaSelector<RType>;
export function createSchemaSelector<RType = any>(entitySchema: schema.Entity, key?: string): ListSchemaSelector<RType>;

/**
 * Create entity list memoized selector.
 *  If empty list is used, default order from matching entity is returned
 *
 *  Memoization is based on previously used id and entities storage
 *
 * @param entitySchema
 * @param key
 */
export function createSchemaSelector<RType = any>(entitySchema: schema.Entity, key: Key<any> = entitySchema.key) {
    let prevIds: Array<string | number> = [];
    let prevArchived: string[] = [];
    let prevEntities: EntitiesData;
    let result: RType[] = [];

    function baseSelector<S extends EntitiesRootState>(state: S, ids: Array<string | number> = [], keyValue: string): RType[] {
        let selectedIds: Array<string | number>;

        if (ids.length) {
            selectedIds = ids;
        } else {
            selectedIds = entitiesSelectors.selectEntityOrder(state, keyValue);
        }

        const archived = entitiesSelectors.selectArchivedEntities(state, keyValue);
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
            selectedIds.filter((id) => !archived.includes(`${id}`)),
            [entitySchema],
            entities,
        ) as RType[];

        return result;
    }

    if (isFunction(key)) {
        return <S extends EntitiesRootState>(state: S, matchObj: match<any> | null, ids: Array<string | number> = []): RType[] => {
            const keyValue = GetKeyValue(key, matchObj);
            return baseSelector(state, ids, keyValue);
        };
    }

    return <S extends EntitiesRootState>(state: S, ids: Array<string | number> = []): RType[] => {
        return baseSelector(state, ids, key);
    };
}


export function createDetailSchemaSelector<RType = any>(entitySchema: schema.Entity, key?: KeyFn<any>): DetailMatchSchemaSelector<RType>;
export function createDetailSchemaSelector<RType = any>(entitySchema: schema.Entity, key?: string): DetailSchemaSelector<RType>;


/**
 * Create single entity memoized selector
 *
 *  Memoization is based on previously used id and entities storage
 *
 * @param entitySchema
 * @param key
 */
export function createDetailSchemaSelector<RType = any>(entitySchema: schema.Entity, key: Key<any> = entitySchema.key) {
    let prevId: string;
    let prevEntities: EntitiesData;
    let result: RType | null = null;

    function baseSelector<S extends EntitiesRootState>(state: S, id: string | number, keyValue: string): RType | null {
        const selectId: string = typeof id === 'number' ? `${id}` : id;

        const entities = entitiesSelectors.selectEntities(state);

        // If entities have not been updated, we can assume that data is still the same
        if (prevId === selectId && prevEntities === entities && result) {
            return result;
        }

        prevId = selectId;
        prevEntities = entities;

        // Return null if entity specified with key or id does not exist
        if (!entities[keyValue] || !((entities[keyValue] || {})[selectId])) {
            return null;
        }

        result = denormalize(selectId, entitySchema, entities) as RType;
        return result;
    }

    if (isFunction(key)) {
        return <S extends EntitiesRootState>(state: S, matchObj: match<any> | null, id: string | number): RType | null => {
            const keyValue = GetKeyValue(key, matchObj);
            return baseSelector(state, id, keyValue);
        };
    }

    return <S extends EntitiesRootState>(state: S, id: string | number): RType | null => {
        return baseSelector(state, id, key);
    };
}
