export enum EntityStatus {
    NotLoaded = 'NotLoaded',
    Fetching = 'Fetching',
    Fetched = 'Fetched',
}

export interface DataObject {
    readonly [key: string]: any;
}

export interface EntitiesDataMap {
    readonly [id: string]: DataObject | undefined;
}

export interface EntitiesData {
    readonly [key: string]: EntitiesDataMap;
}

export interface EntitiesKeys {
    readonly [key: string]: Array<string | number> | undefined;
}

export interface EntitiesStatus {
    readonly [key: string]:
        | EntityStatus.NotLoaded
        | EntityStatus.Fetching
        | EntityStatus.Fetched
        | undefined;
}

export interface EntitiesMetaDataMap {
    readonly [key: string]:
        | DataObject
        | string
        | number
        | any[]
        | null
        | undefined;
}

export interface EntitiesMetaData {
    readonly [key: string]: EntitiesMetaDataMap;
}

export interface EntityKeyPayload {
    key: string;
}

export interface SetEntitiesPayload extends EntityKeyPayload {
    entities: EntitiesData;
    order: string | number | Array<string | number>;
}

export interface EntitiesIdsPayload extends EntityKeyPayload {
    ids: Array<string | number>;
}

export interface EntitiesStatusPayload extends EntityKeyPayload {
    status:
        | EntityStatus.NotLoaded
        | EntityStatus.Fetching
        | EntityStatus.Fetched;
}

export interface EntitiesMetaDataPayload extends EntityKeyPayload {
    metaData: EntitiesMetaDataMap;
}

export interface EntitiesState {
    readonly data: EntitiesData;
    readonly order: EntitiesKeys;
    readonly archived: EntitiesKeys;
    readonly status: EntitiesStatus;
    readonly metaData: EntitiesMetaData;
}

export interface EntitiesRootState {
    readonly entities: EntitiesState;
}

export type KeyOptions = DataObject;

export type KeyFn = (keyOptions: KeyOptions | null) => string;

export type Key = string | KeyFn;

interface InvalidateExtension {
    invalidate: () => void;
}

export interface ListSchemaSelector<RType> extends InvalidateExtension {
    <S extends EntitiesRootState>(
        state: S,
        ids?: Array<string | number>
    ): RType[];
}
export interface ListKeyOptionsSchemaSelector<RType>
    extends InvalidateExtension {
    <S extends EntitiesRootState>(
        state: S,
        keyOptions: KeyOptions | null,
        ids?: Array<string | number>
    ): RType[];
}

export interface DetailSchemaSelector<RType> extends InvalidateExtension {
    <S extends EntitiesRootState>(state: S, id: string | number): RType | null;
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
     * Merge existing metadata objects.
     *  Default: false
     */
    mergeMetadata?: boolean;

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
