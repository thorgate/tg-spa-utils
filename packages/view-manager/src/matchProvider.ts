import { createMatchSelector } from 'connected-react-router';
import { call, select } from 'redux-saga/effects';

import { SagaTask, SagaTaskArgs } from './types';


const typedCallEffect = <
    Params extends { [K in keyof Params]?: string } = {}
>(sagaTask: SagaTask<Params>, ...params: SagaTaskArgs<Params>): ReturnType<typeof call> => (
    (call as any)(sagaTask, ...params) as ReturnType<typeof call>
);


export function* matchProvider<
    Params extends { [K in keyof Params]?: string } = {}
>(pathPattern: string, sagaTask: SagaTask<Params>, ...params: any[]) {
    const matchSelector = createMatchSelector(pathPattern);
    const match = yield select(matchSelector);

    return yield typedCallEffect(sagaTask, match, ...params);
}
