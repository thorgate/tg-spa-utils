import { CALL_HISTORY_METHOD } from 'connected-react-router';
import { Location, parsePath } from 'history';
import { AnyAction, Dispatch, Middleware } from 'redux';

import { ConnectedRouterHistoryActions, SSR_REDIRECT_ACTION } from './types';


export const ssrRedirectMiddleware = <S = any, D extends Dispatch = Dispatch>(): Middleware<{}, S, D> => (
    () => (next) => (action: AnyAction | ConnectedRouterHistoryActions) => {
        if (action.type === CALL_HISTORY_METHOD) {
            const { args, method } = action.payload;
            if (['push', 'replace'].includes(method)) {
                let location: Location;
                if (typeof args[0] === 'string') {
                    location = parsePath(args[0]);
                } else {
                    location = args[0];
                }
                return next({
                    location,
                    type: SSR_REDIRECT_ACTION,
                });
            }
        }

        return next(action);
    }
);
