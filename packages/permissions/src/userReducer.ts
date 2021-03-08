import { createAction, createReducer } from '@reduxjs/toolkit';

interface UserShape {
    readonly id: number;
    readonly email: string;
    readonly username: string | null;
}

export type User = UserShape | null;

export const userActions = {
    setUser: createAction(
        '@@tg-spa-permissions/SET_USER',
        (user: User, isUserAuthenticated: boolean) => ({
            payload: {
                user,
                isAuthenticated: isUserAuthenticated,
            },
        })
    ),
    resetUser: createAction('@@tg-spa-permissions/RESET_USER'),
} as const;

export type UserActions =
    | ReturnType<typeof userActions.setUser>
    | ReturnType<typeof userActions.resetUser>;

export interface UserStateType {
    readonly user: User;
    readonly isAuthenticated: boolean;
}

export interface UserState {
    user: UserStateType;
}

const initialState: UserStateType = {
    user: null,
    isAuthenticated: false,
};

export const userReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(userActions.setUser, (state, action) => {
            state.user = action.payload.user;
            state.isAuthenticated = action.payload.isAuthenticated;
        })
        .addCase(userActions.resetUser, () => {
            return initialState;
        })
        .addDefaultCase((_0, _1) => {
            return undefined;
        });
});

export const getUser = <T extends UserState>(state: T) => state.user.user;

export const isAuthenticated = <T extends UserState>(state: T) =>
    state.user.isAuthenticated;
