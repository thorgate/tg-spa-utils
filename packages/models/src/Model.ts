import { ResourceActionPayload } from '@thorgate/create-resource-saga';
import {
    createDetailSchemaSelector, createFetchAction, createFetchSaga, createSchemaSelector, FetchAction, FetchSaga
} from '@thorgate/spa-entities';
import { createFormSaveSaga, createSaveAction, SaveAction, SaveMeta, SaveSaga } from '@thorgate/spa-forms';
import { Kwargs } from '@thorgate/spa-is';
import { schema } from 'normalizr';
import { match } from 'react-router';
import { Store } from 'redux';
// import { SagaMiddleware } from 'redux-saga';
import { call, takeLatest } from 'redux-saga/effects';
import { Resource } from 'tg-resources';
import { getType } from 'typesafe-actions';

import { ModelOptions, Selectors } from './types';


export class Model<
    K extends string,
    Data,
    Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
> {
    public static registerStore(store: Store) {
    // public static registerStore(store: Store, sagaMiddleware: SagaMiddleware) {
        Model._store = store;
        // Model.sagaMiddleware = sagaMiddleware;
    }

    public readonly schema: schema.Entity;
    public readonly key: K;
    public readonly selectors: Selectors;
    public readonly fetchListAction: FetchAction<string, KW, Data>;
    public readonly fetchListSaga: FetchSaga<Klass, KW, Params, Data>;
    public readonly saveAction: SaveAction<string, Data, KW>;
    public readonly saveSaga: SaveSaga<Data, Klass, KW, Params>;

    public constructor(options: ModelOptions<K, Data, Klass, KW, Params>) {
        const {
            fetchOptions = {},
            saveOptions,
        } = options;

        this.key = options.key;
        this.schema = options.schema;

        this.fetchListAction = createFetchAction(`@@tg-spa-modes/LIST/${this.key}`);
        this.fetchListSaga = createFetchSaga({
            ...fetchOptions,

            key: this.schema.key,
            resource: options.resource,
            listSchema: [this.schema],
        });

        this.selectors = {
            list: createSchemaSelector(this.schema),
            detail: createDetailSchemaSelector(this.schema),
        };

        this.saveAction = createSaveAction(`@@tg-spa-modes/${this.key}/SAVE-DETAILS`);
        this.saveSaga = createFormSaveSaga({
            ...saveOptions,

            resource: options.detailResource || options.resource,
        });

        this.fetchList = this.fetchList.bind(this);
        this.asFetchListWatcher = this.asFetchListWatcher.bind(this);
        this.asFetchDetailsWatcher = this.asFetchDetailsWatcher.bind(this);
        this.asSaveWatcher = this.asSaveWatcher.bind(this);
    }

    private static _store: Store | null;
    // private static sagaMiddleware: SagaMiddleware;

    private static get store(): Store {
        if (!Model._store) {
            throw new Error('Store is not registered for model');
        }

        return Model._store;
    }

    public * fetchList(matchObj: match<Params> | null = null) {
        yield call(this.fetchListSaga, matchObj, this.fetchListAction({}));
    }

    public * asFetchListWatcher() {
        yield takeLatest(getType(this.fetchListAction), this.fetchListSaga, null);
    }

    public * asFetchDetailsWatcher() {
        yield takeLatest(getType(this.fetchListAction), this.fetchListSaga, null);
    }

    public * asSaveWatcher() {
        yield takeLatest(getType(this.saveAction), this.saveSaga, null);
    }

    public list = (ids: Array<string | number> = []) => this.selectors.list(Model.store.getState(), ids);
    public get = (id: string | number) => this.selectors.detail(Model.store.getState(), id);

    public update = (payload: ResourceActionPayload<KW, Data>, meta: SaveMeta<Data>) => {
        Model.store.dispatch(this.saveAction(payload, meta));
    };
}
