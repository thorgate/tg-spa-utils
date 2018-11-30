import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';


const actionFactory = actionCreatorFactory('@@tg-spa-entities');


export interface EntitiesDataMap {
    [id: string]: any | undefined;
}

export interface EntitiesData {
    [key: string]: EntitiesDataMap | undefined;
}

export interface EntitiesKeys {
    [key: string]: string[] | undefined;
}

export interface EntitiesState {
    data: EntitiesData;
    order: EntitiesKeys;
    archived: EntitiesKeys;
}

interface SetStateMetaOptions {
    preserveExisting?: boolean;
    mergeEntities?: boolean;
    updateOrder?: boolean;
    clearArchived?: boolean;
}

const defaultActionMeta: SetStateMetaOptions = {
    preserveExisting: true,
    mergeEntities: false,
    updateOrder: false,
    clearArchived: true,
};

export const setEntities = actionFactory<{
    key: string, entities: any, order: string | string[]
}>('SET_ENTITIES', defaultActionMeta);
export const markArchived = actionFactory<{ key: string, ids: string[] }>('MARK_ARCHIVED');
export const markActive = actionFactory<{ key: string, ids: string[] }>('MARK_ACTIVE');
export const purgeEntities = actionFactory<{ key: string, ids: string[] }>('PURGE_ENTITIES');
export const clearEntities = actionFactory('CLEAR_ENTITIES');


const selectEntities = (state: EntitiesState) => state.data;
const selectEntityType = (state: EntitiesState, key: string) => selectEntities(state)[key] || {};

const selectOrder = (state: EntitiesState) => state.order;
const selectEntityOrder = (state: EntitiesState, key: string) => selectOrder(state)[key] || [];

const selectArchived = (state: EntitiesState) => state.archived;
const selectArchivedEntities = (state: EntitiesState, key: string) => selectArchived(state)[key] || [];


const initialState: EntitiesState = {
    data: {},
    order: {},
    archived: {},
};


export const entitiesReducer = reducerWithInitialState(initialState)
    .caseWithAction(setEntities, (state, { payload, meta }) => {
        const nextState = {
            ...state,
        };

        let nextOrder: string[];
        if (meta!.updateOrder) {
            nextOrder = [...selectEntityOrder(state, payload.key)];

            if (Array.isArray(payload.order)) {
                payload.order.forEach((id) => {
                    if (!nextOrder.includes(id)) {
                        nextOrder.push(id);
                    }
                });
            } else {
                if (!nextOrder.includes(payload.order)) {
                    nextOrder.push(payload.order);
                }
            }
        } else if (Array.isArray(payload.order)) {
            nextOrder = payload.order;
        } else {
            nextOrder = [payload.order];
        }

        // Update order
        nextState.order = {
            ...nextState.order,

            [payload.key]: nextOrder,
        };

        // Create new object - will see later what would be the performance impact
        nextState.data = { ...nextState.data };

        Object.entries(payload.entities).forEach(([key, entities]) => {
            if (!meta!.preserveExisting) {
                nextState.data[key] = entities;
                return;
            }

            nextState.data[key] = Object.entries(entities).reduce((last, [entityId, entity]) => {
                let newEntity = entity;

                if (meta!.mergeEntities) {
                    const oldEntity = last[entityId] || {};
                    newEntity = { ...oldEntity, ...newEntity };
                }

                return {
                    ...last,
                    [entityId]: newEntity,
                };
            }, nextState.data[key] || {});
        });

        if (meta!.clearArchived) {
            nextState.archived = {
                ...nextState.archived,

                [payload.key]: [],
            };
        }

        return nextState;
    })
    .case(markArchived, (state, payload) => (
        Object.assign({}, state, {
            archived: Object.assign({}, state.archived, {
                [payload.key]: payload.ids,
            })
        })
    ))
    .case(markActive, (state, payload) => (
        Object.assign({}, state, {
            archived: Object.assign({}, state.archived, {
                [payload.key]: selectArchivedEntities(state, payload.key).filter((id) => !payload.ids.includes(id)),
            })
        })
    ))
    .case(purgeEntities, (state, payload) => {
        const nextData = { ...selectEntityType(state, payload.key) };

        payload.ids.forEach((id) => {
            if (nextData[id]) {
                delete nextData[id];
            }
        });

        return Object.assign({}, state, {
            order: Object.assign({}, state.order, {
                [payload.key]: selectEntityOrder(state, payload.key).filter((id) => !payload.ids.includes(id)),
            }),

            data: Object.assign({}, state.data, { [payload.key]: nextData }),
        });
    })
    .case(clearEntities, (_0: any, _1: any) => initialState);


export interface EntitiesRootState {
    entities: EntitiesState;
}


const selectEntitiesRoot = <S extends EntitiesRootState>(state: S) => state.entities;


export const entitiesSelectors = {
    selectEntitiesRoot,

    selectEntities: <S extends EntitiesRootState>(state: S) => selectEntities(selectEntitiesRoot(state)),

    selectEntityType: <S extends EntitiesRootState>(state: S, key: string) => selectEntityType(selectEntitiesRoot(state), key),

    selectOrder: <S extends EntitiesRootState>(state: S) => selectOrder(selectEntitiesRoot(state)),

    selectEntityOrder: <S extends EntitiesRootState>(state: S, key: string) => selectEntityOrder(selectEntitiesRoot(state), key),

    selectArchived: <S extends EntitiesRootState>(state: S) => selectArchived(selectEntitiesRoot(state)),

    selectArchivedEntities: <S extends EntitiesRootState>(state: S, key: string) => selectArchivedEntities(selectEntitiesRoot(state), key),
};
