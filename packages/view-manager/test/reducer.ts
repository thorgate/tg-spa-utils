import { errorReducer, ErrorType } from '@thorgate/spa-errors';
import { loadingReducer, LoadingStateType } from '@thorgate/spa-pending-data';
import { connectRouter, RouterState } from 'connected-react-router';
import { combineReducers } from 'redux';


export interface State {
    error: ErrorType;
    router: RouterState;
    loading: LoadingStateType;
    data: {
        [api: string]: any;
    };
}

interface Data {
    [api: string]: any;
}

const initialState: Data = {};


export interface ApiResponseAction {
    type: 'API_RESPONSE';
    response: any;
}

export const setResponse = (response: any): ApiResponseAction => ({
    type: 'API_RESPONSE',
    response,
});

function reducer(state: Data = initialState, action: ApiResponseAction) {
    switch (action.type) {
        case 'API_RESPONSE':
            return action.response;

        default:
            return state;
    }
}

export const rootReducer = (history: any) => combineReducers({
    error: errorReducer,
    router: connectRouter(history),
    loading: loadingReducer,
    data: reducer,
});
