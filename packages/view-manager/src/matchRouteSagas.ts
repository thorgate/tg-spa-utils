import { isRouteSagaObject, isSaga, Kwargs } from '@thorgate/spa-is';
import { matchRoutes } from 'react-router-config';
import { NamedRouteConfig } from 'tg-named-routes';
import warning from 'warning';

import {
    MatchedNamedRoute,
    MatchedSagas,
    MatchRouteSagas,
    MatchWithRoute,
    SagaRunnerTask,
    SagaRunnerTasks,
    SagaTaskType,
    SagaTaskWithArgs,
} from './types';

const mapSaga = <
    Params extends Kwargs<Params> = Record<string, string | undefined>
>(
    sagaToMap: SagaTaskType<Params>,
    routeMatch: MatchWithRoute<Params>
): SagaTaskWithArgs<Params> => {
    if (isRouteSagaObject(sagaToMap)) {
        const { saga, args = [] } = sagaToMap;

        if (Array.isArray(args)) {
            return {
                saga,
                args: [routeMatch, ...args],
            };
        }

        return {
            saga,
            args: [routeMatch, args],
        };
    }

    if (isSaga(sagaToMap)) {
        return {
            saga: sagaToMap,
            args: [routeMatch],
        };
    }

    throw new Error('Misconfiguration: Route saga task is invalid.');
};

const reduceSagas = <
    Params extends Kwargs<Params> = Record<string, string | undefined>
>(
    sagas: SagaRunnerTasks<Params>,
    routeMatch: MatchWithRoute<Params>
): MatchedSagas<Params> =>
    sagas.reduce(
        (result: MatchedSagas<Params>, saga: SagaRunnerTask<Params>) => {
            if (Array.isArray(saga)) {
                return result.concat(
                    saga.map((sagaObj) => mapSaga(sagaObj, routeMatch))
                );
            }

            result.push(mapSaga(saga, routeMatch));
            return result;
        },
        []
    );

export const matchRouteSagas = <Params extends Kwargs<Params>>(
    routes: NamedRouteConfig[],
    pathName: string
): MatchRouteSagas => {
    const branch: Array<MatchedNamedRoute<Params>> = matchRoutes(
        routes,
        pathName
    ) as any;

    const tasks: MatchRouteSagas = {
        initials: [],
        watchers: {},
    };

    branch.forEach(({ route, match: routeMatch }) => {
        if (route.initial) {
            tasks.initials.push(
                ...reduceSagas([route.initial as any], {
                    ...routeMatch,
                    routePattern: route.path,
                })
            );
        }

        warning(
            route.routeName !== undefined,
            `RouteName is missing for ${route.path}`
        );

        if (route.watcher && route.routeName !== undefined) {
            reduceSagas([route.watcher as any], {
                ...routeMatch,
                routePattern: route.path,
            }).forEach((value, index) => {
                tasks.watchers[`${route.routeName}.${index}`] = value;
            });
        }
    });

    return tasks;
};
