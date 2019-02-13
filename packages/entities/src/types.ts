import { ActionPayload, MetaOptions, ResourceActionType } from '@thorgate/create-resource-saga';
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


export type FetchActionType<
    T extends string,
    KW extends Kwargs<KW> = {},
    Data = any
> = ResourceActionType<T, FetchMeta, KW, Data>;

export interface FetchAction<T extends string, KW extends Kwargs<KW> = {}, Data = any> {
    (payload: ActionPayload<KW, Data>, meta?: FetchMeta): ResourceActionType<T, FetchMeta, KW, Data>;

    getType?: () => T;
}


export type InitialAction<
    T extends string,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any,
> = (matchObj: match<Params> | null) => FetchActionType<T, KW, Data>;

export interface FetchSaga<
    T extends string,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any,
> {
    (matchObj: match<Params> | null, action: ResourceActionType<T, FetchMeta, KW, Data>): SagaIterator;

    asInitialWorker: (initialAction: InitialAction<T, KW, Params, Data>) => (matchObj: match<Params> | null) => SagaIterator;
}
