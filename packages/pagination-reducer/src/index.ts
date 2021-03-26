import { createAction, createReducer } from '@reduxjs/toolkit';
import { Query } from 'tg-resources';

export type KwargsType = Query | null | undefined;

interface KwargsState {
    [key: string]: KwargsType;
}

interface HasState {
    [key: string]: boolean;
}

// TODO: Should we use setEntitiesMetaData instead of separate reducer?
// Maybe in future major version.
export const paginationActions = {
    resetPagination: createAction(
        '@@tg-spa/pagination/RESET',
        (name: string) => ({ payload: { name } })
    ),
    setNextKwargs: createAction(
        '@@tg-spa/pagination/SET_NEXT_KWARGS',
        (name: string, kwargs: KwargsType = null) => ({
            payload: { name, kwargs },
        })
    ),
    setCurrentKwargs: createAction(
        '@@tg-spa/pagination/SET_CURRENT_KWARGS',
        (name: string, kwargs: KwargsType = null) => ({
            payload: { name, kwargs },
        })
    ),
    setPrevKwargs: createAction(
        '@@tg-spa/pagination/SET_PREV_KWARGS',
        (name: string, kwargs: KwargsType = null) => ({
            payload: { name, kwargs },
        })
    ),
};

export type PaginationActions =
    | ReturnType<typeof paginationActions.resetPagination>
    | ReturnType<typeof paginationActions.setNextKwargs>
    | ReturnType<typeof paginationActions.setCurrentKwargs>
    | ReturnType<typeof paginationActions.setPrevKwargs>;

export interface PaginationStateObject {
    nextKwargs: KwargsState;
    currentKwargs: KwargsState;
    prevKwargs: KwargsState;
    hasNext: HasState;
    hasPrev: HasState;
}

export interface PaginationState {
    pagination: PaginationStateObject;
}

const initialState: PaginationStateObject = {
    prevKwargs: {},
    currentKwargs: {},
    nextKwargs: {},
    hasNext: {},
    hasPrev: {},
};

export const paginationReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(paginationActions.setNextKwargs, (state, action) => {
            state.nextKwargs[action.payload.name] = action.payload.kwargs;
            state.hasNext[action.payload.name] = action.payload.kwargs
                ? !!Object.keys(action.payload.kwargs).length
                : false;
        })
        .addCase(paginationActions.setCurrentKwargs, (state, action) => {
            state.currentKwargs[action.payload.name] = action.payload.kwargs;
        })
        .addCase(paginationActions.setPrevKwargs, (state, action) => {
            state.prevKwargs[action.payload.name] = action.payload.kwargs;
            state.hasPrev[action.payload.name] = action.payload.kwargs
                ? !!Object.keys(action.payload.kwargs).length
                : false;
        })
        .addCase(paginationActions.resetPagination, (state, action) => {
            if (state.nextKwargs[action.payload.name]) {
                delete state.nextKwargs[action.payload.name];
            }
            if (state.currentKwargs[action.payload.name]) {
                delete state.currentKwargs[action.payload.name];
            }
            if (state.prevKwargs[action.payload.name]) {
                delete state.prevKwargs[action.payload.name];
            }
        })
        .addDefaultCase((_0, _1) => {
            return undefined;
        });
});

const defaultState = {
    prevKwargs: null,
    currentKwargs: null,
    nextKwargs: null,
    hasNext: false,
    hasPrev: false,
};

export const paginationSelectors = {
    /**
     * Select next page kwargs for name.
     * @param state
     * @param name
     */
    selectNextKwargs: <T extends PaginationState>(state: T, name: string) =>
        state.pagination.nextKwargs[name] || defaultState.nextKwargs,

    /**
     * Select current page kwargs for name. Useful for reloading the data.
     * @param state
     * @param name
     */
    selectCurrentKwargs: <T extends PaginationState>(state: T, name: string) =>
        state.pagination.currentKwargs[name] || defaultState.currentKwargs,

    /**
     * Select previous page kwargs for name.
     * @param state
     * @param name
     */
    selectPrevKwargs: <T extends PaginationState>(state: T, name: string) =>
        state.pagination.prevKwargs[name] || defaultState.prevKwargs,

    /**
     * Select if named pagination has next page.
     * @param state
     * @param name
     */
    selectHasNext: <T extends PaginationState>(state: T, name: string) =>
        state.pagination.hasNext[name] || defaultState.hasNext,

    /**
     * Select if named pagination has prev page.
     * @param state
     * @param name
     */
    selectHasPrev: <T extends PaginationState>(state: T, name: string) =>
        state.pagination.hasPrev[name] || defaultState.hasPrev,
};
