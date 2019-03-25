export enum EntityStatus {
    NotLoaded = 'NotLoaded',
    Fetching = 'Fetching',
    Fetched = 'Fetched',
}


export interface EntitiesDataMap {
    [id: string]: any | undefined;
}

export interface EntitiesData {
    [key: string]: EntitiesDataMap | undefined;
}

export interface EntitiesKeys {
    [key: string]: string[] | undefined;
}

export interface EntitiesStatus {
    [key: string]: EntityStatus.NotLoaded | EntityStatus.Fetching | EntityStatus.Fetched | undefined;
}

export interface EntityKeyPayload {
    key: string;
}

export interface SetEntitiesPayload extends EntityKeyPayload {
    entities: any;
    order: string | string[];
}

export interface EntitiesIdsPayload extends EntityKeyPayload {
    ids: string[];
}

export interface EntitiesStatusPayload extends EntityKeyPayload {
    status: EntityStatus.NotLoaded | EntityStatus.Fetching | EntityStatus.Fetched;
}

export interface EntitiesState {
    data: EntitiesData;
    order: EntitiesKeys;
    archived: EntitiesKeys;
    status: EntitiesStatus;
}

export interface EntitiesRootState {
    entities: EntitiesState;
}


/**
 * Normalized fetch options
 */
export interface EntitiesMeta {
    /**
     * Preserve existing entities.
     *  Default: true
     */
    preserveExisting?: boolean;

    /**
     * Merge existing entities.
     *  Default: false
     */
    mergeEntities?: boolean;

    /**
     * Preserve existing order, only update existing entities.
     *  Default: false
     */
    preserveOrder?: boolean;

    /**
     * Append order to existing order.
     *  Default: false
     */
    updateOrder?: boolean;

    /**
     * Remove existing archived entities.
     *  Default: false
     */
    clearArchived?: boolean;

    [key: string]: any;
}
