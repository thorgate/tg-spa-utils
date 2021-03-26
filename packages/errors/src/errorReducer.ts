import { createAction, createReducer } from '@reduxjs/toolkit';

export interface ErrorResponse extends Error {
    statusCode?: number;
    responseText?: string;
}

export type ErrorType = ErrorResponse | null;

export interface ErrorState {
    error: ErrorType;
}

export const errorActions = {
    setError: createAction('@@tg-spa-errors/SET_ERROR', (error: ErrorType) => ({
        payload: error
            ? {
                  name: error.name,
                  statusCode: error.statusCode,
                  message: error.message || error.toString(),
                  stack:
                      process.env.NODE_ENV !== 'production'
                          ? error.stack
                          : undefined,
                  responseText: error.responseText,
              }
            : null,
    })),

    resetError: createAction('@@tg-spa-errors/RESET_ERROR'),
};

export type ErrorActions =
    | ReturnType<typeof errorActions.setError>
    | ReturnType<typeof errorActions.resetError>;

export const errorReducer = createReducer(null as ErrorType, (builder) => {
    builder
        .addCase(errorActions.setError, (_0, action) => {
            return action.payload;
        })
        .addCase(errorActions.resetError, () => {
            return null;
        })
        .addDefaultCase((_0, _1) => {
            return undefined;
        });
});

export const getError = <T extends ErrorState>(state: T): ErrorType =>
    state.error;
