import { Kwargs, RouteSagaObject } from '@thorgate/spa-is';
import { CALL_HISTORY_METHOD } from 'connected-react-router';
import {
    Location,
    LocationDescriptorObject,
    LocationState,
    Path,
} from 'history';
import { match } from 'react-router';
import { NamedRouteConfig } from 'tg-named-routes';

type CALL_HISTORY_METHOD_TYPE = typeof CALL_HISTORY_METHOD;

export const SSR_REDIRECT_ACTION = '@@tg-view-manager/SSR_REDIRECT_ACTION';
export type SSR_REDIRECT_ACTION_TYPE = typeof SSR_REDIRECT_ACTION;

export interface MatchWithRoute<Params extends Kwargs<Params> = {}>
    extends match<Params> {
    routePattern?: string;
}

export type SagaTaskArgs<Params extends Kwargs<Params> = {}> = [
    MatchWithRoute<Params>,
    ...any[]
];

export type SagaTask<Params extends Kwargs<Params> = {}> = (
    match: MatchWithRoute<Params>,
    ...args: any[]
) => Iterator<any>;

export type SagaTaskWithArgs<
    Params extends Kwargs<Params> = {}
> = RouteSagaObject<SagaTaskArgs<Params>>;

export type SagaTaskType<Params extends Kwargs<Params> = {}> =
    | SagaTaskWithArgs<Params>
    | SagaTask<Params>;

export type SagaTasks<Params extends Kwargs<Params> = {}> = Array<
    SagaTaskType<Params>
>;

export type SagaRunnerTask<Params extends Kwargs<Params> = {}> = Array<
    SagaTask<Params> | SagaTaskType<Params>
>;

export type SagaRunnerTasks<Params extends Kwargs<Params> = {}> = Array<
    SagaRunnerTask<Params>
>;

export interface TaskedNamedRouteConfig<Params extends Kwargs<Params> = {}>
    extends NamedRouteConfig {
    initial?: SagaTask<Params> | SagaTaskWithArgs<Params> | SagaTasks<Params>;
    watcher?: SagaTask<Params> | SagaTaskWithArgs<Params> | SagaTasks<Params>;
}

export interface MatchedNamedRoute<Params extends Kwargs<Params> = {}> {
    route: TaskedNamedRouteConfig<Params>;
    match: MatchWithRoute<Params>;
}

export type MatchedSagas<Params extends Kwargs<Params> = {}> = Array<
    SagaTaskWithArgs<Params>
>;

export interface WatcherTasks {
    [routeName: string]: SagaTaskWithArgs<any>;
}

export interface MatchRouteSagas {
    initials: MatchedSagas;
    watchers: WatcherTasks;
}

interface LocationActionPayload<T extends string, A = any[]> {
    method: T;
    args?: A;
}

interface CallHistoryMethodAction<
    T extends string,
    M extends string,
    A = any[]
> {
    type: T;
    payload: LocationActionPayload<M, A>;
}

// Leaving this here as reference for middlewares
export type ConnectedRouterHistoryActions =
    | CallHistoryMethodAction<
          CALL_HISTORY_METHOD_TYPE,
          'push',
          [Path, LocationState?]
      >
    | CallHistoryMethodAction<
          CALL_HISTORY_METHOD_TYPE,
          'push',
          [LocationDescriptorObject<any>]
      >
    | CallHistoryMethodAction<
          CALL_HISTORY_METHOD_TYPE,
          'replace',
          [Path, LocationState?]
      >
    | CallHistoryMethodAction<
          CALL_HISTORY_METHOD_TYPE,
          'replace',
          [LocationDescriptorObject<any>]
      >
    | CallHistoryMethodAction<CALL_HISTORY_METHOD_TYPE, 'go', [number]>
    | CallHistoryMethodAction<CALL_HISTORY_METHOD_TYPE, 'goBack', []>
    | CallHistoryMethodAction<CALL_HISTORY_METHOD_TYPE, 'goForward', []>;

export interface SSRRedirectHistoryActions {
    type: SSR_REDIRECT_ACTION_TYPE;
    location: Location<any>;
}
