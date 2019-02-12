import { Kwargs, RouteSagaObject } from '@thorgate/spa-is';
import { match } from 'react-router';
import { NamedRouteConfig } from 'tg-named-routes';


export interface MatchWithRoute<Params extends Kwargs<Params> = {}> extends match<Params> {
    routePattern?: string;
}

export type SagaTaskArgs<Params extends Kwargs<Params> = {}> = [MatchWithRoute<Params>, ...any[]];

export type SagaTask<
    Params extends Kwargs<Params> = {}
> = (match: MatchWithRoute<Params>, ...args: any[]) => Iterator<any>;

export type SagaTaskWithArgs<Params extends Kwargs<Params> = {}> = RouteSagaObject<SagaTaskArgs<Params>>;

export type SagaTaskType<Params extends Kwargs<Params> = {}> = SagaTaskWithArgs<Params> | SagaTask<Params>;

export type SagaTasks<Params extends Kwargs<Params> = {}> = Array<SagaTaskType<Params>>;

export type SagaRunnerTask<
    Params extends Kwargs<Params> = {}
> = Array<SagaTask<Params> | SagaTaskType<Params>>;

export type SagaRunnerTasks<Params extends Kwargs<Params> = {}> = Array<SagaRunnerTask<Params>>;

export interface TaskedNamedRouteConfig<Params extends Kwargs<Params> = {}> extends NamedRouteConfig {
    initial?: SagaTask<Params> | SagaTaskWithArgs<Params> | SagaTasks<Params>;
    watcher?: SagaTask<Params> | SagaTaskWithArgs<Params> | SagaTasks<Params>;
}


export interface MatchedNamedRoute<Params extends Kwargs<Params> = {}> {
    route: TaskedNamedRouteConfig<Params>;
    match: MatchWithRoute<Params>;
}

export type MatchedSagas<Params extends Kwargs<Params> = {}> = Array<SagaTaskWithArgs<Params>>;

export interface WatcherTasks {
    [routeName: string]: MatchedSagas;
}

export interface MatchRouteSagas {
    initials: MatchedSagas;
    watchers: WatcherTasks;
}
