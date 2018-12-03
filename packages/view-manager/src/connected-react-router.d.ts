import { RouterActionType, RouterState } from 'connected-react-router';
import { Location } from 'history';
import { match } from 'react-router';


declare module 'connected-react-router' {
    interface RouterRootState {
        router: RouterState;
    }

    type matchSelectorFn<
        S extends RouterRootState, Params extends { [K in keyof Params]?: string }
    > = (state: S) => match<Params> | null;

    function getAction<S extends RouterRootState>(state: S): RouterActionType;
    function getLocation<S extends RouterRootState>(state: S): Location;
    function getRouter<S extends RouterRootState>(state: S): RouterState;
    function createMatchSelector<
        S extends RouterRootState, Params extends { [K in keyof Params]?: string }
    >(path: string): matchSelectorFn<S, Params>;
}
