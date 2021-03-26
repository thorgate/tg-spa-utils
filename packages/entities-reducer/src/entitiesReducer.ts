import { createAction, createReducer } from '@reduxjs/toolkit';
import { isObject } from '@thorgate/spa-is';

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
        (payload: SetEntitiesPayload, meta: EntitiesMeta = {}) => ({
            payload,
            meta: { ...defaultActionMeta, ...meta },
        })
    ),

    setEntitiesStatus: createAction(
        '@@tg-spa-entities/SET_ENTITIES_STATUS',
        (payload: EntitiesStatusPayload) => ({ payload })
    ),

    setEntitiesMetaData: createAction(
        '@@tg-spa-entities/SET_ENTITIES_META_DATA',
        (payload: EntitiesMetaDataPayload, meta: EntitiesMeta = {}) => ({
            payload,
            meta: { ...defaultActionMeta, ...meta },
        })
    ),

    markArchived: createAction(
        '@@tg-spa-entities/MARK_ARCHIVED',
        (payload: EntitiesIdsPayload) => ({ payload })
    ),

    markActive: createAction(
        '@@tg-spa-entities/MARK_ACTIVE',
        (payload: EntitiesIdsPayload) => ({ payload })
    ),

    purgeOrder: createAction(
        '@@tg-spa-entities/PURGE_ORDER',
        (payload: EntityKeyPayload) => ({ payload })
    ),

    purgeEntities: createAction(
        '@@tg-spa-entities/PURGE_ENTITIES',
        (payload: EntitiesIdsPayload) => ({ payload })
    ),

    clearEntities: createAction('@@tg-spa-entities/CLEAR_ENTITIES'),
};

export type EntitiesAction =
    | ReturnType<typeof entitiesActions.setEntities>
    | ReturnType<typeof entitiesActions.setEntitiesStatus>
    | ReturnType<typeof entitiesActions.setEntitiesMetaData>
    | ReturnType<typeof entitiesActions.markArchived>
    | ReturnType<typeof entitiesActions.markActive>
    | ReturnType<typeof entitiesActions.purgeOrder>
    | ReturnType<typeof entitiesActions.purgeEntities>
    | ReturnType<typeof entitiesActions.clearEntities>;

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
    order.forEach((item) => {
        if (typeof baseOrder === 'undefined') {
            baseOrder = [];
        }

        if (!baseOrder.includes(item)) {
            baseOrder.push(item);
        }
    });
};

export const entitiesReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(entitiesActions.setEntities, (state, action) => {
            const { meta, payload } = action;

            // Update order if not preserving previous
            if ((meta && !meta.preserveOrder) || !meta) {
                if (meta && meta.updateOrder) {
                    const order = Array.isArray(payload.order)
                        ? payload.order
                        : [payload.order];
                    mutateOrder(state.order[payload.key], order);
                } else if (Array.isArray(payload.order)) {
                    state.order[payload.key] = payload.order;
                } else {
                    state.order[payload.key] = [payload.order];
                }
            }

            // Update entities from the payload
            Object.entries(payload.entities).forEach(([key, entities]) => {
                // Overwrite existing entities
                if (meta && !meta.preserveExisting) {
                    state.data[key] = entities;
                    return;
                }

                // Go through all payload entities to update or merge in the Draft
                Object.entries(entities).forEach(([entityId, entity]) => {
                    let newEntity = entity;

                    if (meta && meta.mergeEntities) {
                        const oldEntity = state.data[key][entityId] || {};
                        newEntity = { ...oldEntity, ...newEntity };
                    }

                    if (state.data[key]) {
                        state.data[key][entityId] = newEntity;
                    } else {
                        state.data[key] = {
                            [entityId]: newEntity,
                        };
                    }
                });
            });

            if (meta && meta.clearArchived) {
                state.archived[payload.key] = [];
            }
        })
        .addCase(entitiesActions.setEntitiesStatus, (state, action) => {
            state.status[action.payload.key] = action.payload.status;
        })
        .addCase(entitiesActions.setEntitiesMetaData, (state, action) => {
            const { meta, payload } = action;

            if (meta && !meta.preserveExisting) {
                state.metaData[payload.key] = payload.metaData;
                return;
            }

            Object.entries(payload.metaData).forEach(([key, metaData]) => {
                let newValue = metaData;

                if (meta && meta.mergeMetadata && isObject(newValue)) {
                    const oldValue = (state.metaData[payload.key] || {})[key];

                    if (isObject(oldValue)) {
                        newValue = { ...oldValue, ...newValue };
                    }
                }

                if (state.metaData[payload.key]) {
                    state.metaData[payload.key][key] = newValue;
                } else {
                    state.metaData[payload.key] = {
                        [key]: newValue,
                    };
                }
            });
        })
        .addCase(entitiesActions.markArchived, (state, action) => {
            state.archived[action.payload.key] = action.payload.ids;
        })
        .addCase(entitiesActions.markActive, (state, action) => {
            state.archived[action.payload.key] = action.payload.ids;
            state.archived[action.payload.key] = selectArchivedEntities(
                state,
                action.payload.key
            ).filter((id) => !action.payload.ids.includes(id));
        })
        .addCase(entitiesActions.purgeEntities, (state, action) => {
            action.payload.ids.forEach((id) => {
                if (
                    state.data[action.payload.key] &&
                    state.data[action.payload.key][id]
                ) {
                    delete state.data[action.payload.key][id];
                }
            });
            state.order[action.payload.key] = selectEntityOrder(
                state,
                action.payload.key
            ).filter((id) => !action.payload.ids.includes(id));
        })
        .addCase(entitiesActions.purgeOrder, (state, action) => {
            state.order[action.payload.key] = [];
        })
        .addCase(entitiesActions.clearEntities, () => {
            return initialState;
        })
        .addDefaultCase((_0, _1) => {
            return undefined;
        });
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
