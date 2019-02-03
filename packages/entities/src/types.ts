import { ActionPayload, ActionType, Kwargs, MetaOptions } from '@thorgate/create-resource-saga';


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
