import { ActionType, createAction, getType } from 'typesafe-actions';


export interface ErrorResponse extends Error {
    statusCode?: number;
    responseText?: string;
}

export type ErrorType = ErrorResponse | null;


export interface ErrorState {
    error: ErrorType;
}


export const errorActions = {
    setError: createAction('@@tg-spa-errors/SET_ERROR', (resolve) => (
        (error: ErrorType) => resolve({
            error: error ? {
                name: error.name,
                statusCode: error.statusCode,
                message: error.message || error.toString(),
                stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
                responseText: error.responseText,
            } : null,
        })
    )),

    resetError: createAction('@@tg-spa-errors/RESET_ERROR'),
};


export type ErrorActions = ActionType<typeof errorActions>;


export function errorReducer(state: ErrorType = null, action: ErrorActions): ErrorType {
    switch (action.type) {
        case getType(errorActions.setError):
            return action.payload.error;

        case getType(errorActions.resetError):
            return null;

        default:
            return state;
    }
}


export const getError = <T extends ErrorState>(state: T): ErrorType => (
    state.error
);
