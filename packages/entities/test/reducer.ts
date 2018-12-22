import { errorReducer, ErrorState } from '@thorgate/spa-errors';
import { combineReducers } from 'redux';

import { entitiesReducer, EntitiesRootState } from '../src';


export interface State extends ErrorState, EntitiesRootState {
}

export const reducer = combineReducers({
    entities: entitiesReducer,
    error: errorReducer,
});
