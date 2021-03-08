import { isFunction } from '@thorgate/spa-is';
import Cache, { Options as LRUOptions } from 'lru-cache';
import { denormalize, schema } from 'normalizr';

import { GetKeyValue } from './entitiesKey';
import { entitiesSelectors } from './entitiesReducer';
import {
    DetailSchemaSelector,
    EntitiesData,
    EntitiesRootState,
    Key,
    KeyFn,
    KeyOptions,
    ListKeyOptionsSchemaSelector,
    ListSchemaSelector,
} from './types';

export function createSchemaSelector<RType = any>(
    entitySchema: schema.Entity,
    key?: string,
    options?: LRUOptions<Array<string | number>, RType[]>
): ListSchemaSelector<RType>;
export function createSchemaSelector<RType = any>(
    entitySchema: schema.Entity,
    key?: KeyFn,
    options?: LRUOptions<Array<string | number>, RType[]>
): ListKeyOptionsSchemaSelector<RType>;

/**
 * Create entity list memoized selector.
 *  If empty list is used, default order from matching entity is returned
 *
 *  Memoization is based on previously used id and entities storage
 *
 * @param entitySchema
 * @param key
 * @param options
 */
export function createSchemaSelector<RType = any>(
    entitySchema: schema.Entity,
    key: Key = entitySchema.key,
    options?: LRUOptions<Array<string | number>, RType[]>
) {
    let prevArchived: Array<string | number> = [];
    let prevEntities: EntitiesData;

    const selectorCache = new Cache<Array<string | number>, RType[]>(
        options || {
            maxAge: 5 * 60 * 1000, // Cache for 5 minutes
            max: 50, // Keep 50 latest values in cache
        }
    );

    function invalidate() {
        selectorCache.reset();
    }

    function baseSelector<S extends EntitiesRootState>(
        state: S,
        ids: Array<string | number> = [],
        keyValue: string
    ): RType[] {
        let selectedIds: Array<string | number>;

        if (ids.length) {
            selectedIds = ids;
        } else {
            selectedIds = entitiesSelectors.selectEntityOrder(state, keyValue);
        }

        const archived: Array<
            string | number
        > = entitiesSelectors.selectArchivedEntities(state, keyValue);
        const entities = entitiesSelectors.selectEntities(state);

        if (archived !== prevArchived || prevEntities !== entities) {
            selectorCache.reset();
        }

        let result: RType[] | undefined = selectorCache.get(selectedIds);

        if (result !== undefined) {
            return result;
        }

        prevArchived = archived;
        prevEntities = entities;

        // Return empty array if entity specified with key does not exist
        if (!entities[entitySchema.key]) {
            result = [];
        } else {
            result = denormalize(
                selectedIds.filter((id) => !archived.includes(id)),
                [entitySchema],
                entities
            ) as RType[];
        }

        // Update cache
        selectorCache.set(selectedIds, result);

        return result;
    }

    if (isFunction(key)) {
        return Object.assign(
            <S extends EntitiesRootState>(
                state: S,
                keyOptions: KeyOptions | null,
                ids: Array<string | number> = []
            ): RType[] => {
                const keyValue = GetKeyValue(key, keyOptions);
                return baseSelector(state, ids, keyValue);
            },
            { invalidate }
        );
    }

    return Object.assign(
        <S extends EntitiesRootState>(
            state: S,
            ids: Array<string | number> = []
        ): RType[] => {
            return baseSelector(state, ids, key);
        },
        { invalidate }
    );
}

export function createDetailSchemaSelector<RType = any>(
    entitySchema: schema.Entity,
    options?: LRUOptions<string | number, RType | null>
): DetailSchemaSelector<RType>;

/**
 * Create single entity memoized selector
 *
 *  Memoization is based on previously used id and entities storage
 *
 * @param entitySchema
 * @param options
 */
export function createDetailSchemaSelector<RType = any>(
    entitySchema: schema.Entity,
    options?: LRUOptions<string | number, RType | null>
) {
    let prevEntities: EntitiesData;

    const selectorCache = new Cache<string | number, RType | null>(
        options || {
            maxAge: 5 * 60 * 1000, // Cache for 5 minutes
            max: 50, // Keep 50 latest values in cache
        }
    );

    function invalidate() {
        selectorCache.reset();
    }

    const selector = <S extends EntitiesRootState>(
        state: S,
        id: string | number
    ): RType | null => {
        const entities = entitiesSelectors.selectEntities(state);

        if (prevEntities !== entities) {
            selectorCache.reset();
        }

        let result = selectorCache.get(id);

        // If entities have not been updated, we can assume that data is still the same
        if (result !== undefined) {
            return result;
        }

        prevEntities = entities;

        // Return null if entity specified with key or id does not exist
        if (
            !entities[entitySchema.key] ||
            !(entities[entitySchema.key] || {})[id]
        ) {
            result = null;
        } else {
            result = denormalize(id, entitySchema, entities) as RType;
        }
        selectorCache.set(id, result);
        return result;
    };

    return Object.assign(selector, { invalidate });
}
