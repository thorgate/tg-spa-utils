import { ActionPayload, ActionType, MetaOptions } from '@thorgate/create-resource-saga';
import { match } from 'react-router';
import { SagaIterator } from 'redux-saga';
import { Kwargs } from 'tg-resources';


export interface FetchMeta extends MetaOptions {
    preserveExisting?: boolean;
    mergeEntities?: boolean;
    preserveOrder?: boolean;
    updateOrder?: boolean;
    clearArchived?: boolean;

    asDetails?: boolean;

    callback?: () => void;
}


export interface FetchAction<T extends string, KW extends Kwargs<KW> = {}, Data = any> {
    (payload: ActionPayload<KW, Data>, meta?: FetchMeta): ActionType<T, FetchMeta, KW, Data>;

    getType?: () => T;
}


export type MatchToAction<
    T extends string,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any,
> = (matchObj: match<Params> | null) => ActionType<T, FetchMeta, KW, Data>;

export interface FetchSaga<
    T extends string,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any,
> {
    (matchObj: match<Params> | null, action: ActionType<T, FetchMeta, KW, Data>): SagaIterator;

    asInitialWorker: (matchToAction: MatchToAction<T, KW, Params, Data>) => (matchObj: match<Params> | null) => SagaIterator;
}
