import { createDetailSchemaSelector, CreateFetchSagaOptions, createSchemaSelector } from '@thorgate/spa-entities';
import { CreateFormSaveSagaOptions } from '@thorgate/spa-forms';
import { Kwargs, Omit } from '@thorgate/spa-is';
import { schema } from 'normalizr';
import { Resource } from 'tg-resources';


export interface Selectors {
    list: ReturnType<typeof createSchemaSelector>;
    detail: ReturnType<typeof createDetailSchemaSelector>;
}


export interface ModelOptions<
    K extends string,
    Data,
    Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
> {
    key: K;

    schema: schema.Entity;

    resource: Klass;
    detailResource: Klass;

    fetchOptions?: Omit<CreateFetchSagaOptions<Klass, KW, Params, Data>, 'listSchema' | 'key' | 'resource'>;
    saveOptions: Omit<CreateFormSaveSagaOptions<Data, Klass, KW, Params>, 'resource'>;
}
