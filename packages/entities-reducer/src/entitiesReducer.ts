import { isObject } from '@thorgate/spa-is';
import { produce } from 'immer';
import { ActionType, createAction, getType } from 'typesafe-actions';

import {
    EntitiesIdsPayload,
    EntitiesMeta,
    // EntitiesMetaDataMap,
    EntitiesMetaDataPayload,
    EntitiesRootState,
    EntitiesState,
    EntitiesStatusPayload,
    EntityKeyPayload,
    EntityStatus,
    SetEntitiesPayload,
} from './types';

const defaultActionMeta: EntitiesMeta = {
    preserveExisting: true,
    mergeEntities: false,
    mergeMetadata: false,
    preserveOrder: false,
    updateOrder: false,
    clearArchived: true,
};

export const entitiesActions = {
    setEntities: createAction(
        '@@tg-spa-entities/SET_ENTITIES',
        createHandler => (
            payload: SetEntitiesPayload,
            meta: EntitiesMeta = {}
        ) => createHandler(payload, { ...defaultActionMeta, ...meta })
    ),

    setEntitiesStatus: createAction(
        '@@tg-spa-entities/SET_ENTITIES_STATUS',
        createHandler => (payload: EntitiesStatusPayload) =>
            createHandler(payload)
    ),

    setEntitiesMetaData: createAction(
        '@@tg-spa-entities/SET_ENTITIES_META_DATA',
        createHandler => (
            payload: EntitiesMetaDataPayload,
            meta: EntitiesMeta = {}
        ) => createHandler(payload, { ...defaultActionMeta, ...meta })
    ),

    markArchived: createAction(
        '@@tg-spa-entities/MARK_ARCHIVED',
        createHandler => (payload: EntitiesIdsPayload) => createHandler(payload)
    ),

    markActive: createAction(
        '@@tg-spa-entities/MARK_ACTIVE',
        createHandler => (payload: EntitiesIdsPayload) => createHandler(payload)
    ),

    purgeOrder: createAction(
        '@@tg-spa-entities/PURGE_ORDER',
        createHandler => (payload: EntityKeyPayload) => createHandler(payload)
    ),

    purgeEntities: createAction(
        '@@tg-spa-entities/PURGE_ENTITIES',
        createHandler => (payload: EntitiesIdsPayload) => createHandler(payload)
    ),

    clearEntities: createAction('@@tg-spa-entities/CLEAR_ENTITIES'),
};

export type EntitiesAction = ActionType<typeof entitiesActions>;

const selectEntities = (state: EntitiesState) => state.data;
const selectEntityType = (state: EntitiesState, key: string) =>
    selectEntities(state)[key] || {};

const selectOrder = (state: EntitiesState) => state.order;
const selectEntityOrder = (
    state: EntitiesState,
    key: string
): Array<string | number> => selectOrder(state)[key] || [];

const selectArchived = (state: EntitiesState) => state.archived;
const selectArchivedEntities = (
    state: EntitiesState,
    key: string
): Array<string | number> => selectArchived(state)[key] || [];

const selectStatuses = (state: EntitiesState) => state.status;
const selectEntitiesStatus = (state: EntitiesState, key: string) =>
    selectStatuses(state)[key] || EntityStatus.NotLoaded;

const selectMetaData = (state: EntitiesState) => state.metaData;
const selectEntitiesMetaData = (state: EntitiesState, key: string) =>
    selectMetaData(state)[key] || {};

const initialState: EntitiesState = {
    data: {},
    order: {},
    archived: {},
    status: {},
    metaData: {},
};

const mutateOrder = <T>(baseOrder: T[] | undefined, order: T[]) => {
    order.forEach(item => {
        if (typeof baseOrder === 'undefined') {
            baseOrder = [];
        }

        if (!baseOrder.includes(item)) {
            baseOrder.push(item);
        }
    });
};

export const entitiesReducer = (
    state: EntitiesState = initialState,
    action: EntitiesAction
) =>
    produce(state, draft => {
        switch (action.type) {
            case getType(entitiesActions.setEntities): {
                const { meta, payload } = action;

                // Update order if not preserving previous
                if ((meta && !meta.preserveOrder) || !meta) {
                    if (meta && meta.updateOrder) {
                        const order = Array.isArray(payload.order)
                            ? payload.order
                            : [payload.order];
                        mutateOrder(draft.order[payload.key], order);
                    } else if (Array.isArray(payload.order)) {
                        draft.order[payload.key] = payload.order;
                    } else {
                        draft.order[payload.key] = [payload.order];
                    }
                }

                // Update entities from the payload
                Object.entries(payload.entities).forEach(([key, entities]) => {
                    // Overwrite existing entities
                    if (meta && !meta.preserveExisting) {
                        draft.data[key] = entities;
                        return;
                    }

                    // Go through all payload entities to update or merge in the Draft
                    Object.entries(entities).forEach(([entityId, entity]) => {
                        let newEntity = entity;

                        if (meta && meta.mergeEntities) {
                            const oldEntity = draft.data[key][entityId] || {};
                            newEntity = { ...oldEntity, ...newEntity };
                        }

                        if (draft.data[key]) {
                            draft.data[key][entityId] = newEntity;
                        } else {
                            draft.data[key] = {
                                [entityId]: newEntity,
                            };
                        }
                    });
                });

                if (meta && meta.clearArchived) {
                    draft.archived[payload.key] = [];
                }
                return;
            }

            case getType(entitiesActions.setEntitiesStatus):
                draft.status[action.payload.key] = action.payload.status;
                return;

            case getType(entitiesActions.setEntitiesMetaData): {
                const { meta, payload } = action;

                if (meta && !meta.preserveExisting) {
                    draft.metaData[payload.key] = payload.metaData;
                    return;
                }

                Object.entries(payload.metaData).forEach(([key, metaData]) => {
                    let newValue = metaData;

                    if (meta && meta.mergeMetadata && isObject(newValue)) {
                        const oldValue = (draft.metaData[payload.key] || {})[
                            key
                        ];

                        if (isObject(oldValue)) {
                            newValue = { ...oldValue, ...newValue };
                        }
                    }

                    if (draft.metaData[payload.key]) {
                        draft.metaData[payload.key][key] = newValue;
                    } else {
                        draft.metaData[payload.key] = {
                            [key]: newValue,
                        };
                    }
                });
                return;
            }

            case getType(entitiesActions.markArchived):
                draft.archived[action.payload.key] = action.payload.ids;
                return;

            case getType(entitiesActions.markActive):
                draft.archived[action.payload.key] = action.payload.ids;
                draft.archived[action.payload.key] = selectArchivedEntities(
                    draft,
                    action.payload.key
                ).filter(id => !action.payload.ids.includes(id));
                return;

            case getType(entitiesActions.purgeEntities): {
                action.payload.ids.forEach(id => {
                    if (
                        draft.data[action.payload.key] &&
                        draft.data[action.payload.key][id]
                    ) {
                        delete draft.data[action.payload.key][id];
                    }
                });
                draft.order[action.payload.key] = selectEntityOrder(
                    draft,
                    action.payload.key
                ).filter(id => !action.payload.ids.includes(id));
                return;
            }

            case getType(entitiesActions.purgeOrder):
                draft.order[action.payload.key] = [];
                return;

            case getType(entitiesActions.clearEntities):
                return initialState;

            default:
                return state;
        }
    });

/**
 * Select entities root state.
 */
const selectEntitiesRoot = <S extends EntitiesRootState>(state: S) =>
    state.entities;

export const entitiesSelectors = {
    selectEntitiesRoot,

    /**
     * Select entities data.
     * @param state
     */
    selectEntities: <S extends EntitiesRootState>(state: S) =>
        selectEntities(selectEntitiesRoot(state)),

    /**
     * Select specific entity type.
     * @param state
     * @param key
     */
    selectEntityType: <S extends EntitiesRootState>(state: S, key: string) =>
        selectEntityType(selectEntitiesRoot(state), key),

    /**
     * Select entities order.
     * @param state
     */
    selectOrder: <S extends EntitiesRootState>(state: S) =>
        selectOrder(selectEntitiesRoot(state)),

    /**
     * Select specific entity order.
     * @param state
     * @param key
     */
    selectEntityOrder: <S extends EntitiesRootState>(state: S, key: string) =>
        selectEntityOrder(selectEntitiesRoot(state), key),

    /**
     * Select entities archive.
     * @param state
     */
    selectArchived: <S extends EntitiesRootState>(state: S) =>
        selectArchived(selectEntitiesRoot(state)),

    /**
     * Select specific archived entity order.
     * @param state
     * @param key
     */
    selectArchivedEntities: <S extends EntitiesRootState>(
        state: S,
        key: string
    ) => selectArchivedEntities(selectEntitiesRoot(state), key),

    /**
     * Select entities statuses.
     * @param state
     */
    selectStatuses: <S extends EntitiesRootState>(state: S) =>
        selectStatuses(selectEntitiesRoot(state)),

    /**
     * Select specific entity status.
     * @param state
     * @param key
     */
    selectEntitiesStatus: <S extends EntitiesRootState>(
        state: S,
        key: string
    ) => selectEntitiesStatus(selectEntitiesRoot(state), key),

    /**
     * Select entities metaData.
     * @param state
     */
    selectMetaData: <S extends EntitiesRootState>(state: S) =>
        selectMetaData(selectEntitiesRoot(state)),

    /**
     * Select specific entity metaData.
     * @param state
     * @param key
     */
    selectEntitiesMetaData: <S extends EntitiesRootState>(
        state: S,
        key: string
    ) => selectEntitiesMetaData(selectEntitiesRoot(state), key),
};
