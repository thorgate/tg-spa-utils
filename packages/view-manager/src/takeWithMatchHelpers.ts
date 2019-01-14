import { createMatchSelector } from 'connected-react-router';
import { Action } from 'redux';
import {
    ActionPattern,
    AllButLast,
    call,
    cancel,
    fork,
    select,
    Tail,
    take
} from 'redux-saga/effects';
import { First, Last } from 'typescript-tuple';
import { MatchWithRoute } from './types';


export type AllButFirst<L extends any[]> = Tail<L>;

export type HelperProviderParameters<
    T, Params extends { [K in keyof Params]?: string }, Fn extends (...args: [any, ...any[]]) => any
> = Last<Parameters<Fn>> extends T ? (
    First<Parameters<Fn>> extends MatchWithRoute<Params> ? AllButFirst<AllButLast<Parameters<Fn>>> : never
) : never;


export function takeEveryWithMatch<
    A extends Action,
    Fn extends (...args: any[]) => any,
    Params extends { [K in keyof Params]?: string } = {}
>(
    actionPattern: ActionPattern<A>, routePattern: string | undefined,
    saga: Fn, ...args: HelperProviderParameters<A, Params, Fn>
) {
    return fork(function* () {
        if (!routePattern) {
            throw new Error('Route pattern is required');
        }
        const matchSelector = createMatchSelector(routePattern);
        while (true) {
            const action = yield take(actionPattern);

            const matched = yield select(matchSelector);
            yield fork(saga as any, matched, ...args.concat(action));
        }
    });
}


export function takeLatestWithMatch<
    A extends Action,
    Fn extends (...args: any[]) => any,
    Params extends { [K in keyof Params]?: string } = {}
>(
    actionPattern: ActionPattern<A>, routePattern: string | undefined,
    saga: Fn, ...args: HelperProviderParameters<A, Params, Fn>
) {
    return fork(function* () {
        if (!routePattern) {
            throw new Error('Route pattern is required');
        }
        const matchSelector = createMatchSelector(routePattern);
        let lastTask;
        while (true) {
            const action = yield take(actionPattern);

            if (lastTask) {
                yield cancel(lastTask); // cancel is no-op if the task has already terminated
            }

            const matched = yield select(matchSelector);
            lastTask = yield fork(saga as any, matched, ...args.concat(action));
        }
    });
}


export function takeLeadingWithMatch<
    A extends Action,
    Fn extends (...args: any[]) => any,
    Params extends { [K in keyof Params]?: string } = {}
>(
    actionPattern: ActionPattern<A>, routePattern: string | undefined,
    saga: Fn, ...args: HelperProviderParameters<A, Params, Fn>
) {
    return fork(function* () {
        if (!routePattern) {
            throw new Error('Route pattern is required');
        }
        const matchSelector = createMatchSelector(routePattern);
        while (true) {
            const action = yield take(actionPattern);

            const matched = yield select(matchSelector);
            yield call(saga as any, matched, ...args.concat(action));
        }
    });
}
