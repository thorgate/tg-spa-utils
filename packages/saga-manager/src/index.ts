import { Task } from '@redux-saga/types';
import { Store } from 'redux';
import { SagaMiddleware } from 'redux-saga';
import { call, cancel, fork, take } from 'redux-saga/effects';

export type ReportError = (error: any) => void;
export type RootSaga = (hot?: boolean) => Iterator<any>;

const CANCEL_SAGAS_HMR = '@@tg-saga-manager/CANCEL_SAGAS_HMR';
const DEFAULT_RETRIES = 10;

export interface ReloadOptions {
    enableHotReload?: boolean;
    maxRetries?: number;
    onError?: ReportError;
}

function* runAbortAbleSaga(
    saga: RootSaga,
    hot = false,
    options?: ReloadOptions
): Iterator<any> {
    const maxRetries = (options && options.maxRetries) || DEFAULT_RETRIES;
    let retryCount = 0;

    const enableHotReload =
        options && options.enableHotReload !== undefined
            ? options.enableHotReload
            : process.env.NODE_ENV !== 'production';

    while (retryCount < maxRetries) {
        try {
            if (enableHotReload) {
                const sagaTask: Task | undefined = yield fork(
                    saga,
                    hot || retryCount > 0
                );

                yield take(CANCEL_SAGAS_HMR);

                if (sagaTask) {
                    yield cancel(sagaTask);
                }

                // Stop execution
                break;
            } else {
                yield call(saga, retryCount > 0);
            }
        } catch (err) {
            if (options && options.onError) {
                options.onError(err);
            }

            retryCount += 1;
        }
    }
}

export class SagaHotReloader<S = any> {
    public constructor(
        store: Store<S>,
        sagaMiddleWare: SagaMiddleware,
        options?: ReloadOptions
    ) {
        this.store = store;
        this.sagaMiddleWare = sagaMiddleWare;
        this.options = options;
    }

    public get runningTask() {
        return this._runningTask;
    }

    private readonly store: Store<S>;
    private readonly sagaMiddleWare: SagaMiddleware;
    private readonly options?: ReloadOptions;
    private _runningTask: Task | null = null;

    public startRootSaga(saga: RootSaga) {
        this._runningTask = this.sagaMiddleWare.run(
            runAbortAbleSaga,
            saga,
            false,
            this.options
        );
    }

    public stopRootSaga() {
        if (!this.runningTask) {
            // eslint-disable-next-line no-console
            console.log('No root saga is running');
            return;
        }

        this.store.dispatch({ type: CANCEL_SAGAS_HMR });
        return this.runningTask.toPromise().then(() => {
            // eslint-disable-next-line no-console
            console.log('Running root saga has been stopped.');
            this._runningTask = null;
        });
    }

    public replaceRootSaga(saga: RootSaga) {
        if (!this.runningTask) {
            // eslint-disable-next-line no-console
            console.log('No root saga is running');
            return;
        }

        return (this.stopRootSaga() as Promise<any>).then(() => {
            // eslint-disable-next-line no-console
            console.log('Replaced root saga.');
            this._runningTask = this.sagaMiddleWare.run(
                runAbortAbleSaga as any,
                saga,
                true,
                this.options
            );
        });
    }
}
