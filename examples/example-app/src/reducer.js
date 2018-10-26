import { errorReducer } from '@thorgate/spa-errors'
import { loadingReducer } from '@thorgate/spa-pending-data'
import { userReducer } from '@thorgate/spa-permissions'
import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';


export default (history) => combineReducers({
    router: connectRouter(history),
    error: errorReducer,
    loading: loadingReducer,
    user: userReducer,
});
