import { Store } from 'redux';
import { SagaIterator, SagaMiddleware, Task } from 'redux-saga';
import { call, cancel, fork, take } from 'redux-saga/effects';


export type ReportError = (error: any) => void;
export type RootSaga = (hot?: boolean) => SagaIterator;

const CANCEL_SAGAS_HMR = '@@tg-saga-manager/CANCEL_SAGAS_HMR';
const DEFAULT_RETRIES = 10;


export interface ReloadOptions {
    maxRetries?: number;
    onError?: ReportError;
}

function* runAbortAbleSaga(saga: RootSaga, hot: boolean = false, options?: ReloadOptions) {
    const maxRetries = (options && options.maxRetries) || DEFAULT_RETRIES;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            if (process.env.NODE_ENV !== 'production') {
                const sagaTask = yield fork(saga, hot);

                yield take(CANCEL_SAGAS_HMR);
                yield cancel(sagaTask);
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
    public constructor(store: Store<S>, sagaMiddleWare: SagaMiddleware, options?: ReloadOptions) {
        this.store = store;
        this.sagaMiddleWare = sagaMiddleWare;
        this.options = options;
    }

    private readonly store: Store<S>;
    private readonly sagaMiddleWare: SagaMiddleware;
    private readonly options?: ReloadOptions;
    private runningTask: Task | null = null;

    public startRootSaga(saga: RootSaga) {
        this.runningTask = this.sagaMiddleWare.run(runAbortAbleSaga, saga, false, this.options);
    }

    public stopRootSaga() {
        if (!this.runningTask) {
            console.log('No root saga is running');
            return;
        }

        this.store.dispatch({ type: CANCEL_SAGAS_HMR });
        return this.runningTask.toPromise().then(() => {
            console.log('Running root saga has been stopped.');
            this.runningTask = null;
        });
    }

    public replaceRootSaga(saga: RootSaga) {
        if (!this.runningTask) {
            console.log('No root saga is running');
            return;
        }

        return (this.stopRootSaga() as Promise<any>).then(() => {
            console.log('Replaced root saga.');
            this.runningTask = this.sagaMiddleWare.run(runAbortAbleSaga, saga, true, this.options);
        });
    }
}
