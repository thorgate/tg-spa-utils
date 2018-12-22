# `@thorgate/spa-entities`

> Normalized data storage helper.


## Basic Usage

```
import { createFetchAction, createFetchSaga, createSchemaSelector } from '@thorgate/spa-entities';
import { schema } from 'normalizr';
import { getType } from 'typesafe-actions';

const article = new schema.Entity('articles');

const fetchAction = createFetchAction('fetch/articles');

// Create worker to fetch data
const fetchSaga = createFetchSaga({
    resource: new FetchResource('/articles'),
    // method: 'fetch', // This is the default value
    key: article.key,
    listSchema: [article],
});

const schemaSelector = createSchemaSelector(article);


function* fetchArticleWatcher() {
    yield takeLatest(getType(fetchAction), fetchSaga);
}
```


## NormalizedFetchOptions

- ``listSchema``: *(schema.Entity[])*: Required: List schema to be used for serialization
- ``key``: *(string)*: Required: Field name under which key order is stored under
- ``resource``: *(Resource|SagaResource<Resource>)*: Resource instance used to fetch data
- ``method``: *(string)*: Resource method used
- ``apiFetchHook``: *((action: ActionType<Params>) => any | Iterator<any>)*: Custom fetch method. This can be used to customize response or dispatch additional actions. 
- ``serializeData``: *((result: any, listSchema: schema.Entity[]) => {result: any, entities: any} | Iterator<Effect | {result: any, entities: any}>)*: Custom serializer method. 
                                                                                            This can be used to customize response or dispatch additional actions.
- ``timeoutMs``: *(number)*: Timeout after which request is cancelled and error is thrown. Default: ``3000``


## `createFetchAction` Payload object

- ``kwargs``: *(Object)*: Optionally URL kwargs to pass to ``<resource>.<method>``
- ``query``: *(Object)*: Optionally URL Query parameters to pass to ``<resource>.<method>``
- ``data``: *(Object)*: Optionally POST like data to pass to ``<resource>.<method>``
- ``callback``: *(Function)*: Function to call when fetch saga finishes
