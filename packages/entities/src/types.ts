import { Query } from 'tg-resources';


export interface ActionPayload<Params extends { [K in keyof Params]?: string | undefined; } = {}> {
    kwargs?: Params | null;
    query?: Query | null;
    callback?: () => void;
    data?: any;
}


export interface SetStateMetaOptions {
    preserveExisting?: boolean;
    mergeEntities?: boolean;
    updateOrder?: boolean;
    clearArchived?: boolean;
}
