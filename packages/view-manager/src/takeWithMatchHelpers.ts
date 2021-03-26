import { Kwargs } from '@thorgate/spa-is';
import { createMatchSelector } from 'connected-react-router';
import { match } from 'react-router';
import { Action } from 'redux';
import { Task } from 'redux-saga';
import {
    ActionPattern,
    AllButLast,
    call,
    cancel,
    fork,
    ForkEffect,
    select,
    Tail,
    take,
} from 'redux-saga/effects';
import { First, Last } from 'typescript-tuple';

import { MatchWithRoute } from './types';

export type AllButFirst<L extends any[]> = Tail<L>;

export type HelperProviderParameters<
    T,
    Params extends Kwargs<Params>,
    Fn extends (...args: [any, ...any[]]) => any
> = Last<Parameters<Fn>> extends T
    ? First<Parameters<Fn>> extends MatchWithRoute<Params>
        ? AllButFirst<AllButLast<Parameters<Fn>>>
        : never
    : never;

export function takeEveryWithMatch<
    A extends Action,
    Fn extends (...args: any[]) => any,
    Params extends Kwargs<Params> = Record<string, string | undefined>
>(
    actionPattern: ActionPattern<A>,
    routePattern: string | undefined,
    saga: Fn,
    ...args: HelperProviderParameters<A, Params, Fn>
): ForkEffect {
    return fork(function* () {
        if (!routePattern) {
            throw new Error('Route pattern is required');
        }
        const matchSelector = createMatchSelector(routePattern);
        while (true) {
            const action: A = yield take(actionPattern);
            const matched: match<any> | null = yield select(matchSelector);

            const params: Parameters<Fn> = [matched, ...args, action] as any;
            yield fork(saga, ...params);
        }
    });
}

export function takeLatestWithMatch<
    A extends Action,
    Fn extends (...args: any[]) => any,
    Params extends Kwargs<Params> = Record<string, string | undefined>
>(
    actionPattern: ActionPattern<A>,
    routePattern: string | undefined,
    saga: Fn,
    ...args: HelperProviderParameters<A, Params, Fn>
): ForkEffect {
    return fork(function* () {
        if (!routePattern) {
            throw new Error('Route pattern is required');
        }
        const matchSelector = createMatchSelector(routePattern);
        let lastTask: Task | undefined;
        while (true) {
            const action: A = yield take(actionPattern);

            if (lastTask) {
                yield cancel(lastTask); // cancel is no-op if the task has already terminated
            }

            const matched: match<any> | null = yield select(matchSelector);

            const params: Parameters<Fn> = [matched, ...args, action] as any;
            lastTask = yield fork(saga, ...params);
        }
    });
}

export function takeLeadingWithMatch<
    A extends Action,
    Fn extends (...args: any[]) => any,
    Params extends Kwargs<Params> = Record<string, string | undefined>
>(
    actionPattern: ActionPattern<A>,
    routePattern: string | undefined,
    saga: Fn,
    ...args: HelperProviderParameters<A, Params, Fn>
): ForkEffect {
    return fork(function* () {
        if (!routePattern) {
            throw new Error('Route pattern is required');
        }
        const matchSelector = createMatchSelector(routePattern);
        while (true) {
            const action: A = yield take(actionPattern);

            const matched: match<any> | null = yield select(matchSelector);
            const params: Parameters<Fn> = [matched, ...args, action] as any;
            yield call(saga, ...params);
        }
    });
}
