import { ActionType, createAction, getType } from 'typesafe-actions';


interface UserShape {
    readonly id: number;
    readonly email: string;
    readonly username: string | null;
}

export type User = UserShape | null;


export const userActions = {
    setUser: createAction('@@tg-spa-permissions/SET_USER', (resolve) => (
        (user: User, isUserAuthenticated: boolean) => resolve({
            user,
            isAuthenticated: isUserAuthenticated,
        })
    )),
    resetUser: createAction('@@tg-spa-permissions/RESET_USER'),
};

export type UserActions = ActionType<typeof userActions>;


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

export function userReducer(state: UserStateType = initialState, action: UserActions): UserStateType {
    switch (action.type) {
        case getType(userActions.resetUser):
            return initialState;

        case getType(userActions.setUser):
            return {
                ...state,
                user: action.payload.user,
                isAuthenticated: action.payload.isAuthenticated,
            };

        default:
            return state;
    }
}


export const getUser = <T extends UserState>(state: T) => (
    state.user.user
);

export const isAuthenticated = <T extends UserState>(state: T) => (
    state.user.isAuthenticated
);
