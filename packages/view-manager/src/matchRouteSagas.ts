import { isRouteSagaObject, isSaga, RouteSagaObject, SagaFn } from '@thorgate/spa-is';
import { matchRoutes } from 'react-router-config';
import { MatchedNamedRoute, NamedRouteConfig } from 'tg-named-routes';
import warning from 'warning';


export type MatchedSaga = RouteSagaObject<any>;

export type MatchedSagas = MatchedSaga[];

export type SagaRunnerTaskType = Array<MatchedSaga | SagaFn>;

export interface WatcherTasks {
    [routeName: string]: MatchedSagas;
}

export interface MatchRouteSagas {
    initials: MatchedSagas;
    watchers: WatcherTasks;
}


const mapSaga = (sagaToMap: MatchedSaga | SagaFn, extraArgs: any[]): MatchedSaga => {
    if (isRouteSagaObject(sagaToMap)) {
        const { saga, args = [] } = sagaToMap;

        if (Array.isArray(args)) {
            return {
                saga,
                args: [...args, ...extraArgs],
            };
        }

        return {
            saga,
            args: [args, ...extraArgs],
        };
    }

    if (isSaga(sagaToMap)) {
        return {
            saga: sagaToMap,
            args: extraArgs,
        };
    }

    throw new Error('Misconfiguration: Route saga task is invalid.');
};


const reduceSagas = (sagas: SagaRunnerTaskType[], extraArgs: any[] = []): MatchedSagas => (
    sagas.reduce((result: Array<RouteSagaObject<any>>, saga) => {
        if (Array.isArray(saga)) {
            return result.concat(saga.map((sagaObj) => mapSaga(sagaObj, extraArgs)));
        }

        result.push(mapSaga(saga, extraArgs));
        return result;
    }, [])
);


export const matchRouteSagas = <Params extends { [K in keyof Params]?: string }>(
    routes: NamedRouteConfig[], pathName: string
): MatchRouteSagas => {
    const branch: Array<MatchedNamedRoute<Params>> = matchRoutes(routes, pathName);

    const tasks: MatchRouteSagas = {
        initials: [],
        watchers: {},
    };

    branch.forEach(({ route, match }) => {
        if (route.initial) {
            tasks.initials.push(...reduceSagas([route.initial], [match]));
        }

        warning(route.routeName !== undefined, `RouteName is missing for ${route.path}`);

        if (route.watcher && route.routeName) {
            tasks.watchers[route.routeName] = reduceSagas([route.watcher], [match]);
        }
    });

    return tasks;
};
