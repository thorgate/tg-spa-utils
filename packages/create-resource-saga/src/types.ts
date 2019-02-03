import { Attachments, Query } from 'tg-resources';


// To future me: Move this to `tg-resources`
export type Kwargs<KW> = { [K in keyof KW]?: string | undefined; };


export interface ActionPayload<
    KW extends Kwargs<KW> = {}, Data = any
> {
    kwargs?: KW | null;
    query?: Query | null;
    data?: Data;
    attachments?: Attachments | null;
}

export interface MetaOptions {
    [key: string]: any;
}

export interface ActionType <
    T extends string, Meta extends MetaOptions = {}, KW extends Kwargs<KW> = {}, Data = any
> {
    type: T;
    payload: ActionPayload<KW, Data>;
    meta: Meta;
}


export type ResourceAction<
    T extends string, Meta extends MetaOptions = {}, KW extends Kwargs<KW> = {}, Data = any
> = (payload: ActionPayload<KW, Data>, meta?: Meta | MetaOptions) => ActionType<T, Meta | MetaOptions, KW, Data>;
