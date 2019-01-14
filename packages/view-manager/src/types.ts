import { RouteSagaObject } from '@thorgate/spa-is';
import { match } from 'react-router';
import { NamedRouteConfig } from 'tg-named-routes';


export interface MatchWithRoute<Params extends { [K in keyof Params]?: string } = {}> extends match<Params> {
    routePattern?: string;
}

export type SagaTaskArgs<Params extends { [K in keyof Params]?: string } = {}> = [MatchWithRoute<Params>, ...any[]];

export type SagaTask<
    Params extends { [K in keyof Params]?: string } = {}
> = (match: MatchWithRoute<Params>, ...args: any[]) => Iterator<any>;

export type SagaTaskWithArgs<Params extends { [K in keyof Params]?: string } = {}> = RouteSagaObject<SagaTaskArgs<Params>>;

export type SagaTaskType<Params extends { [K in keyof Params]?: string } = {}> = SagaTaskWithArgs<Params> | SagaTask<Params>;

export type SagaTasks<Params extends { [K in keyof Params]?: string } = {}> = Array<SagaTaskType<Params>>;

export type SagaRunnerTask<
    Params extends { [K in keyof Params]?: string } = {}
> = Array<SagaTask<Params> | SagaTaskType<Params>>;

export type SagaRunnerTasks<Params extends { [K in keyof Params]?: string } = {}> = Array<SagaRunnerTask<Params>>;

export interface TaskedNamedRouteConfig<Params extends { [K in keyof Params]?: string } = {}> extends NamedRouteConfig {
    initial?: SagaTask<Params> | SagaTaskWithArgs<Params> | SagaTasks<Params>;
    watcher?: SagaTask<Params> | SagaTaskWithArgs<Params> | SagaTasks<Params>;
}


export interface MatchedNamedRoute<Params extends { [K in keyof Params]?: string } = {}> {
    route: TaskedNamedRouteConfig<Params>;
    match: MatchWithRoute<Params>;
}

export type MatchedSagas<Params extends { [K in keyof Params]?: string } = {}> = Array<SagaTaskWithArgs<Params>>;

export interface WatcherTasks {
    [routeName: string]: MatchedSagas;
}

export interface MatchRouteSagas {
    initials: MatchedSagas;
    watchers: WatcherTasks;
}
