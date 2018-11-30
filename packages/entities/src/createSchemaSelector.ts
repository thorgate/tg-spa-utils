import { denormalize, schema } from 'normalizr';

import { EntitiesRootState, entitiesSelectors } from './entitiesReducer';


// TODO : Change to memoized version
// TODO : Create promised based selector to send fetch action and resolve when specific action is resolved
// Second part requires worker - left for future package / release
export function createSchemaSelector(entitySchema: schema.Entity) {
    return <S extends EntitiesRootState>(state: S, ...idAttr: string[]) => {
        let selectedIds: string[];

        if (idAttr.length) {
            selectedIds = idAttr;
        } else {
            selectedIds = entitiesSelectors.selectEntityOrder(state, entitySchema.key);
        }

        const archived = entitiesSelectors.selectArchivedEntities(state, entitySchema.key);
        selectedIds = selectedIds.filter((id) => !archived.includes(id));

        const entities = entitiesSelectors.selectEntities(state);

        // Return empty array if entity specified with key does not exist
        if (!entities[entitySchema.key]) {
            return [];
        }

        return denormalize(selectedIds, [entitySchema], entities);
    };
}
