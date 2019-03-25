import { EntitiesData, EntitiesRootState, entitiesSelectors } from '@thorgate/spa-entities-reducer';
import { denormalize, schema } from 'normalizr';


/**
 * Create entity list memoized selector.
 *  If empty list is used, default order from matching entity is returned
 *
 *  Memoization is based on previously used id and entities storage
 *
 * @param entitySchema
 */
export function createSchemaSelector<RType = any>(entitySchema: schema.Entity) {
    let prevIds: Array<string | number> = [];
    let prevArchived: string[] = [];
    let prevEntities: EntitiesData;
    let result: RType[] = [];

    return <S extends EntitiesRootState>(state: S, ids: Array<string | number> = []): RType[] => {
        let selectedIds: Array<string | number>;

        if (ids.length) {
            selectedIds = ids;
        } else {
            selectedIds = entitiesSelectors.selectEntityOrder(state, entitySchema.key);
        }

        const archived = entitiesSelectors.selectArchivedEntities(state, entitySchema.key);
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
    };
}


/**
 * Create single entity memoized selector
 *
 *  Memoization is based on previously used id and entities storage
 *
 * @param entitySchema
 */
export function createDetailSchemaSelector<RType = any>(entitySchema: schema.Entity) {
    let prevId: string;
    let prevEntities: EntitiesData;
    let result: RType | null = null;

    return <S extends EntitiesRootState>(state: S, id: string | number): RType | null => {
        const selectId: string = typeof id === 'number' ? `${id}` : id;

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
