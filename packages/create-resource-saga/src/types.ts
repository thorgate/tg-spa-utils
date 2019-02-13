import { Kwargs } from '@thorgate/spa-is';
import { match } from 'react-router';
import { SagaIterator } from 'redux-saga';
import { Attachments, Query, ResourceMethods } from 'tg-resources';


export interface ActionPayload<
    KW extends Kwargs<KW> = {}, Data = any
> {
    kwargs?: KW | null;
    query?: Query | null;
    data?: Data;
    attachments?: Attachments | null;
    method?: ResourceMethods;
}

export interface MetaOptions {
    [key: string]: any;
}

export interface ResourceActionType <
    T extends string, Meta extends MetaOptions = {}, KW extends Kwargs<KW> = {}, Data = any
> {
    type: T;
    payload: ActionPayload<KW, Data>;
    meta: Meta;
}

export type ResourceSaga<
    T extends string,
    Meta extends {} = {},
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
    Data = any,
> = (matchObj: match<Params> | null, action: ResourceActionType<T, Meta, KW, Data>) => SagaIterator;
