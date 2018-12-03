import { createMatchSelector, getLocation, RouterRootState } from 'connected-react-router';
import { Location } from 'history';
import { call, select } from 'redux-saga/effects';

import { SagaTask, SagaTaskArgs } from './types';


const typedCallEffect = <
    Params extends { [K in keyof Params]?: string } = {}
>(sagaTask: SagaTask<Params>, ...params: SagaTaskArgs<Params>): ReturnType<typeof call> => (
    (call as any)(sagaTask, ...params) as ReturnType<typeof call>
);


export function* matchProvider<
    S extends RouterRootState, Params extends { [K in keyof Params]?: string } = {}
>(sagaTask: SagaTask<Params>, ...params: any[]) {
    const location = yield select<S, Location>(getLocation);
    const matchSelector = createMatchSelector(location.pathname);
    const match = yield select(matchSelector);
    yield typedCallEffect(sagaTask, match, ...params);
}
