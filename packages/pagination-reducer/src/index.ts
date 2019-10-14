import { combineReducers } from 'redux';
import { Query } from 'tg-resources';
import { ActionType, createAction, getType } from 'typesafe-actions';

export type KwargsType = Query | null | undefined;

interface KwargsState {
    [key: string]: KwargsType;
}

interface HasState {
    [key: string]: boolean;
}

// TODO: Should we use setEntitiesMetaData instead of separate reducer?
export const paginationActions = {
    resetPagination: createAction(
        '@@tg-spa/pagination/RESET',
        resolve => (name: string) => resolve({ name })
    ),
    setNextKwargs: createAction(
        '@@tg-spa/pagination/SET_NEXT_KWARGS',
        resolve => (name: string, kwargs: KwargsType = null) =>
            resolve({ name, kwargs })
    ),
    setCurrentKwargs: createAction(
        '@@tg-spa/pagination/SET_CURRENT_KWARGS',
        resolve => (name: string, kwargs: KwargsType = null) =>
            resolve({ name, kwargs })
    ),
    setPrevKwargs: createAction(
        '@@tg-spa/pagination/SET_PREV_KWARGS',
        resolve => (name: string, kwargs: KwargsType = null) =>
            resolve({ name, kwargs })
    ),
};

export type PaginationActions = ActionType<typeof paginationActions>;

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

const initialState = {
    prevKwargs: null,
    currentKwargs: null,
    nextKwargs: null,
    hasNext: false,
    hasPrev: false,
};

function nextKwargsReducer(state: KwargsState = {}, action: PaginationActions) {
    switch (action.type) {
        case getType(paginationActions.resetPagination): {
            const newState = { ...state };
            delete newState[action.payload.name];
            return newState;
        }

        case getType(paginationActions.setNextKwargs):
            return {
                ...state,

                [action.payload.name]: action.payload.kwargs,
            };

        default:
            return state;
    }
}

function currentKwargsReducer(
    state: KwargsState = {},
    action: PaginationActions
) {
    switch (action.type) {
        case getType(paginationActions.resetPagination): {
            const newState = { ...state };
            delete newState[action.payload.name];
            return newState;
        }

        case getType(paginationActions.setCurrentKwargs):
            return {
                ...state,

                [action.payload.name]: action.payload.kwargs,
            };

        default:
            return state;
    }
}

function prevKwargsReducer(state: KwargsState = {}, action: PaginationActions) {
    switch (action.type) {
        case getType(paginationActions.resetPagination): {
            const newState = { ...state };
            delete newState[action.payload.name];
            return newState;
        }

        case getType(paginationActions.setPrevKwargs):
            return {
                ...state,

                [action.payload.name]: action.payload.kwargs,
            };

        default:
            return state;
    }
}

function hasNextReducer(state: HasState = {}, action: PaginationActions) {
    switch (action.type) {
        case getType(paginationActions.resetPagination): {
            const newState = { ...state };
            delete newState[action.payload.name];
            return newState;
        }

        case getType(paginationActions.setNextKwargs):
            return {
                ...state,

                [action.payload.name]: action.payload.kwargs
                    ? !!Object.keys(action.payload.kwargs).length
                    : false,
            };

        default:
            return state;
    }
}

function hasPrevReducer(state: HasState = {}, action: PaginationActions) {
    switch (action.type) {
        case getType(paginationActions.resetPagination): {
            const newState = { ...state };
            delete newState[action.payload.name];
            return newState;
        }

        case getType(paginationActions.setPrevKwargs):
            return {
                ...state,

                [action.payload.name]: action.payload.kwargs
                    ? !!Object.keys(action.payload.kwargs).length
                    : false,
            };

        default:
            return state;
    }
}

export const paginationReducer = combineReducers<
    PaginationStateObject,
    PaginationActions
>({
    nextKwargs: nextKwargsReducer,
    currentKwargs: currentKwargsReducer,
    prevKwargs: prevKwargsReducer,
    hasNext: hasNextReducer,
    hasPrev: hasPrevReducer,
});

export const paginationSelectors = {
    /**
     * Select next page kwargs for name.
     * @param state
     * @param name
     */
    selectNextKwargs: <T extends PaginationState>(state: T, name: string) =>
        state.pagination.nextKwargs[name] || initialState.nextKwargs,

    /**
     * Select current page kwargs for name. Useful for reloading the data.
     * @param state
     * @param name
     */
    selectCurrentKwargs: <T extends PaginationState>(state: T, name: string) =>
        state.pagination.currentKwargs[name] || initialState.currentKwargs,

    /**
     * Select previous page kwargs for name.
     * @param state
     * @param name
     */
    selectPrevKwargs: <T extends PaginationState>(state: T, name: string) =>
        state.pagination.prevKwargs[name] || initialState.prevKwargs,

    /**
     * Select if named pagination has next page.
     * @param state
     * @param name
     */
    selectHasNext: <T extends PaginationState>(state: T, name: string) =>
        state.pagination.hasNext[name] || initialState.hasNext,

    /**
     * Select if named pagination has prev page.
     * @param state
     * @param name
     */
    selectHasPrev: <T extends PaginationState>(state: T, name: string) =>
        state.pagination.hasPrev[name] || initialState.hasPrev,
};
