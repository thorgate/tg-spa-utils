import { errorActions } from '@thorgate/spa-errors';
import { loadingActions } from '@thorgate/spa-pending-data';
import { LOCATION_CHANGE, LocationChangeAction, RouterState } from 'connected-react-router';
import { Effect, Task } from 'redux-saga';
import { all, call, cancel, fork, put, spawn, take } from 'redux-saga/effects';
import { NamedRouteConfig } from 'tg-named-routes';

import { matchRouteSagas } from './matchRouteSagas';
import { sagaRunner } from './sagaRunner';
import { SagaTaskWithArgs, WatcherTasks } from './types';


export interface ViewManagerOptions {
    allowLogger?: boolean;
}

interface RunningWatcherTasks {
    [routeName: string]: Task[];
}

interface WatcherEffects {
    [routeName: string]: Effect;
}

const mapToStartArgs = <
    Params extends { [K in keyof Params]?: string } = {}
>({ saga, args }: SagaTaskWithArgs): ReturnType<typeof spawn> => (
    args ? (spawn as any)(saga, ...args) : spawn(saga)
);


/**
 * Create watcher sagas as top-level sagas and manage them when view context changes.
 *
 * If parent routes are not used any more, running saga will be stopped.
 *
 * @param runningWatchers Currently running watcher tasks
 * @param watcherTasks New route watcher tasks
 */
function* manageWatchers(runningWatchers: RunningWatcherTasks, watcherTasks: WatcherTasks) {
    const newRouteTasks = Object.keys(watcherTasks);
    const alreadyRunning = Object.keys(runningWatchers);

    // Create new tasks
    const watchersToStart: WatcherEffects = {};
    newRouteTasks
        .filter((routeName) => !alreadyRunning.includes(routeName))
        .forEach((routeName) => {
            watchersToStart[routeName] = all(watcherTasks[routeName].map(mapToStartArgs));
        });

    // Start not running tasks again
    // This is to ensure that watcher that have crashed or have finished execution will be started again
    newRouteTasks.filter((routeName) => alreadyRunning.includes(routeName)).forEach((routeName) => {
        if (!runningWatchers[routeName]) {
            return;
        }

        runningWatchers[routeName].forEach((task) => {
            if (task && !task.isRunning()) {
                watchersToStart[routeName] = all(watcherTasks[routeName].map(mapToStartArgs));
            }
        });
    });

    const started = yield all(watchersToStart);
    Object.keys(started).forEach((key) => {
        runningWatchers[key] = started[key];
    });

    // Stop removed tasks
    const watchersToStop: WatcherEffects = {};
    alreadyRunning.filter((routeName) => !newRouteTasks.includes(routeName)).forEach((routeName) => {
        watchersToStop[routeName] = all(runningWatchers[routeName].map((task) => cancel(task)));
    });

    const stopped = yield all(watchersToStop);
    Object.keys(stopped).forEach((key) => {
        delete runningWatchers[key]; // eslint-disable-line no-param-reassign
    });
}


export const createLocationAction = (payload: RouterState): LocationChangeAction => ({ type: LOCATION_CHANGE, payload });


export function* ViewManagerWorker(
    routes: NamedRouteConfig[], { payload: { location } }: LocationChangeAction,
    options: ViewManagerOptions = {}, runningWatchers: RunningWatcherTasks = {}
) {
    try {
        yield put(loadingActions.startLoadingView());

        if (process.env.NODE_ENV !== 'production' && options.allowLogger) {
            console.log('Starting loading location', location);
        }

        // reset previous error just to be sure new error is displayed correctly
        yield put(errorActions.resetError());

        // find initial sagas to run from routeConfig
        const { initials, watchers } = matchRouteSagas(routes, location.pathname);

        // Start required watchers, when watcher is already running, keep them running
        // This will result in that top-level route watcher sagas will always be running
        // Any sub-route watcher sagas will be also started
        yield call(manageWatchers, runningWatchers, watchers);

        // if any initial data sagas present, start them
        if (initials.length) {
            // Start initial data loading sagas in background
            yield call(sagaRunner, initials);
        }

        if (process.env.NODE_ENV !== 'production' && options.allowLogger) {
            console.log('Finished loading location', location);
        }

    } catch (err) {
        yield put(errorActions.setError(err));
    } finally {
        yield put(loadingActions.finishLoadingView());
    }
}

export function* ServerViewManagerWorker(
    routes: NamedRouteConfig[], locationAction: LocationChangeAction, options: ViewManagerOptions = {}
) {
    const runningWatchers = {};
    yield call(ViewManagerWorker, routes, locationAction, options, runningWatchers);
    yield call(manageWatchers, runningWatchers, {});
}


function* runViewManagerWorker(routes: NamedRouteConfig[], runningWatchers: RunningWatcherTasks, options: ViewManagerOptions) {
    let task: Task | null = null;

    while (true) {
        const action = yield take(LOCATION_CHANGE);

        if (task) {
            yield cancel(task);
        }

        task = yield fork(ViewManagerWorker, routes, action, options, runningWatchers);
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
export function* ViewManager(routes: NamedRouteConfig[], options: ViewManagerOptions = {}) {
    const runningWatchers: RunningWatcherTasks = {};

    try {
        yield call(runViewManagerWorker, routes, runningWatchers, options);
    } finally {
        if (process.env.NODE_ENV !== 'production') {
            console.log('ViewManager cancelled !');
        }

        // Cancel all running watchers
        yield call(manageWatchers, runningWatchers, {});
    }
}
