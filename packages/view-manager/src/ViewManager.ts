import { Effect, Task } from '@redux-saga/types';
import { errorActions } from '@thorgate/spa-errors';
import { Kwargs } from '@thorgate/spa-is';
import { loadingActions } from '@thorgate/spa-pending-data';
import {
    getLocation,
    LOCATION_CHANGE,
    LocationChangeAction,
    RouterState,
} from 'connected-react-router';
import { Location } from 'history';
import { SagaIterator } from 'redux-saga';
import {
    all,
    call,
    cancel,
    fork,
    put,
    race,
    select,
    spawn,
    take,
} from 'redux-saga/effects';
import { NamedRouteConfig } from 'tg-named-routes';

import { matchRouteSagas } from './matchRouteSagas';
import { sagaRunner } from './sagaRunner';
import {
    SagaTaskWithArgs,
    SSR_REDIRECT_ACTION,
    SSRRedirectHistoryActions,
    WatcherTasks,
} from './types';

export interface ViewManagerOptions {
    allowLogger?: boolean;
    skipInitialsForFirstRendering?: boolean;
}

export interface ServerViewManagerContext {
    location?: Location<any>;
}

interface RunningTasks {
    [routeName: string]: Task;
}

interface WatcherEffects {
    [routeName: string]: Effect;
}

const mapToStartArgs = <
    Params extends Kwargs<Params> = Record<string, string | undefined>
>({
    saga,
    args,
}: SagaTaskWithArgs): ReturnType<typeof spawn> =>
    args ? (spawn as any)(saga, ...args) : spawn(saga);

/**
 * Create watcher sagas as top-level sagas and manage them when view context changes.
 *
 * If parent routes are not used any more, running saga will be stopped.
 *
 * @param runningWatchers Currently running watcher tasks
 * @param watcherTasks New route watcher tasks
 */
function* manageWatchers(
    runningWatchers: RunningTasks,
    watcherTasks: WatcherTasks
) {
    const newRouteTasks = Object.keys(watcherTasks);
    const alreadyRunning = Object.keys(runningWatchers);

    // Create new tasks
    const watchersToStart: WatcherEffects = {};
    newRouteTasks
        .filter((taskKey) => !alreadyRunning.includes(taskKey))
        .forEach((taskKey) => {
            watchersToStart[taskKey] = mapToStartArgs(watcherTasks[taskKey]);
        });

    // Start not running tasks again
    // This is to ensure that watcher that have crashed or have finished execution will be started again
    newRouteTasks
        .filter((taskKey) => alreadyRunning.includes(taskKey))
        .forEach((taskKey) => {
            if (!runningWatchers[taskKey]) {
                return;
            }

            if (!runningWatchers[taskKey].isRunning()) {
                watchersToStart[taskKey] = mapToStartArgs(
                    watcherTasks[taskKey]
                );
            }
        });

    const started: RunningTasks = yield all(watchersToStart);
    Object.keys(started).forEach((taskKey) => {
        runningWatchers[taskKey] = started[taskKey];
    });

    // Stop removed tasks
    const watchersToStop: WatcherEffects = {};
    alreadyRunning
        .filter((taskKey) => !newRouteTasks.includes(taskKey))
        .forEach((taskKey) => {
            watchersToStop[taskKey] = cancel(runningWatchers[taskKey]);
        });

    const stopped: RunningTasks = yield all(watchersToStop);
    Object.keys(stopped).forEach((key) => {
        delete runningWatchers[key];
    });
}

export const createLocationAction = (
    payload: RouterState,
    isFirstRendering = false
): LocationChangeAction => ({
    type: LOCATION_CHANGE,
    payload: { ...payload, isFirstRendering },
});

function* ViewManagerWorker(
    routes: NamedRouteConfig[],
    { payload: { location } }: LocationChangeAction,
    options: ViewManagerOptions = {},
    runningWatchers: RunningTasks = {},
    firstRendering = false
): SagaIterator {
    try {
        if (process.env.NODE_ENV !== 'production' && options.allowLogger) {
            // eslint-disable-next-line no-console
            console.log('Starting loading location', location);
        }

        // reset previous error just to be sure new error is displayed correctly
        yield put(errorActions.resetError());

        // find initial sagas to run from routeConfig
        const { initials, watchers } = matchRouteSagas(
            routes,
            location.pathname
        );

        // Start required watchers, when watcher is already running, keep them running
        // This will result in that top-level route watcher sagas will always be running
        // Any sub-route watcher sagas will be also started
        yield call(manageWatchers, runningWatchers, watchers);

        // if any initial data sagas present, start them (if necessary)
        if (initials.length) {
            // Skip running initial sagas if first render
            // Currently connected-react-router creates LOCATION_CHANGE action on router mount
            // To prevent initials running both on server and client, we skip initials for the first rendering
            // See https://github.com/supasate/connected-react-router/blob/master/src/ConnectedRouter.js#L66
            const initialsLoaded =
                options.skipInitialsForFirstRendering && firstRendering;
            if (!initialsLoaded) {
                // Start initial data loading sagas in background
                yield call(sagaRunner, initials);
            }
        }

        if (process.env.NODE_ENV !== 'production' && options.allowLogger) {
            // eslint-disable-next-line no-console
            console.log('Finished loading location', location);
        }
    } catch (err) {
        yield put(errorActions.setError(err));
    } finally {
        yield put(loadingActions.setLoadedView(location.key));
    }
}

export function* ServerViewManagerWorker(
    routes: NamedRouteConfig[],
    locationAction: LocationChangeAction,
    options: ViewManagerOptions = {},
    context: ServerViewManagerContext = {}
): SagaIterator {
    const runningWatchers = {};

    const result: {
        interrupt?: SSRRedirectHistoryActions;
        finished?: boolean;
    } = yield race({
        interrupt: take(SSR_REDIRECT_ACTION),
        finished: call(
            ViewManagerWorker,
            routes,
            locationAction,
            options,
            runningWatchers
        ),
    });

    if (result.interrupt) {
        context.location = result.interrupt.location;
    }

    const location: Location = yield select(getLocation);

    if (location.pathname !== locationAction.payload.location.pathname) {
        context.location = location;
    }

    // Reset running tasks
    yield call(manageWatchers, runningWatchers, {});
}

function* runViewManagerWorker(
    routes: NamedRouteConfig[],
    runningWatchers: RunningTasks,
    options: ViewManagerOptions
) {
    let task: Task | null = null;

    while (true) {
        const action: LocationChangeAction = yield take(LOCATION_CHANGE);

        if (task) {
            yield cancel(task);
        }

        task = yield fork(
            ViewManagerWorker,
            routes,
            action,
            options,
            runningWatchers,
            action.payload.isFirstRendering
        );
    }
}

/**
 * Start sagas to handle data loading per view.
 * Sagas to run are determined from `routes`.
 *
 * @param routes Routes object to render correct tasks
 * @param options View manager options
 * @returns {void}
 */
export function* ViewManager(
    routes: NamedRouteConfig[],
    options: ViewManagerOptions = {}
): SagaIterator {
    const runningWatchers: RunningTasks = {};

    try {
        yield call(runViewManagerWorker, routes, runningWatchers, options);
    } finally {
        if (process.env.NODE_ENV !== 'production' && options.allowLogger) {
            // eslint-disable-next-line no-console
            console.log('ViewManager cancelled !');
        }

        // Cancel all running watchers
        yield call(manageWatchers, runningWatchers, {});
    }
}
