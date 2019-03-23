import { entitiesReducer, EntitiesRootState } from '@thorgate/spa-entities-reducer';
import { errorReducer, ErrorState } from '@thorgate/spa-errors';
import { combineReducers } from 'redux';


export interface State extends ErrorState, EntitiesRootState {
}

export const reducer = combineReducers({
    entities: entitiesReducer,
    error: errorReducer,
});
