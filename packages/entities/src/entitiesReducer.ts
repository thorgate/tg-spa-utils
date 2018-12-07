import { ActionType, createAction, getType } from 'typesafe-actions';

import { SetStateMetaOptions } from './types';


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


const defaultActionMeta: SetStateMetaOptions = {
    preserveExisting: true,
    mergeEntities: false,
    updateOrder: false,
    clearArchived: true,
};

export interface SetEntitiesPayload {
    key: string;
    entities: any;
    order: string | string[];
}

export interface EntitiesIdsPayload {
    key: string;
    ids: string[];
}

export const entitiesActions = {
    setEntities: createAction('@@tg-spa-entities/SET_ENTITIES', (resolve) => (
        (payload: SetEntitiesPayload, meta: SetStateMetaOptions = {}) => {
            return resolve(payload, { ...defaultActionMeta, ...meta });
        }
    )),

    markArchived: createAction('@@tg-spa-entities/MARK_ARCHIVED', (resolve) => (
        (payload: EntitiesIdsPayload) => resolve(payload)
    )),

    markActive: createAction('@@tg-spa-entities/MARK_ACTIVE', (resolve) => (
        (payload: EntitiesIdsPayload) => resolve(payload)
    )),

    purgeEntities: createAction('@@tg-spa-entities/PURGE_ENTITIES', (resolve) => (
        (payload: EntitiesIdsPayload) => resolve(payload)
    )),

    clearEntities: createAction('@@tg-spa-entities/CLEAR_ENTITIES'),
};

export type EntitesAction = ActionType<typeof entitiesActions>;


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


export const entitiesReducer = (state: EntitiesState = initialState, action: EntitesAction) => {
    switch (action.type) {
        case getType(entitiesActions.setEntities): {
            const { meta, payload } = action;

            const nextState = {
                ...state,
            };

            let nextOrder: string[];
            if (meta && meta.updateOrder) {
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
                if (meta && !meta.preserveExisting) {
                    nextState.data[key] = entities;
                    return;
                }

                nextState.data[key] = Object.entries(entities).reduce((last, [entityId, entity]) => {
                    let newEntity = entity;

                    if (meta && meta.mergeEntities) {
                        const oldEntity = last[entityId] || {};
                        newEntity = { ...oldEntity, ...newEntity };
                    }

                    return {
                        ...last,
                        [entityId]: newEntity,
                    };
                }, nextState.data[key] || {});
            });

            if (meta && meta.clearArchived) {
                nextState.archived = {
                    ...nextState.archived,

                    [payload.key]: [],
                };
            }

            return nextState;
        }

        case getType(entitiesActions.markArchived):
            return Object.assign({}, state, {
                archived: Object.assign({}, state.archived, {
                    [action.payload.key]: action.payload.ids,
                })
            });

        case getType(entitiesActions.markActive):
            return Object.assign({}, state, {
                archived: Object.assign({}, state.archived, {
                    [action.payload.key]: (
                        selectArchivedEntities(state, action.payload.key).filter((id) => !action.payload.ids.includes(id))
                    ),
                })
            });

        case getType(entitiesActions.purgeEntities): {
            const nextData = { ...selectEntityType(state, action.payload.key) };

            action.payload.ids.forEach((id) => {
                if (nextData[id]) {
                    delete nextData[id];
                }
            });

            return Object.assign({}, state, {
                order: Object.assign({}, state.order, {
                    [action.payload.key]: (
                        selectEntityOrder(state, action.payload.key).filter((id) => !action.payload.ids.includes(id))
                    ),
                }),

                data: Object.assign({}, state.data, { [action.payload.key]: nextData }),
            });
        }

        case getType(entitiesActions.clearEntities):
            return initialState;

        default:
            return state;
    }
};

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
