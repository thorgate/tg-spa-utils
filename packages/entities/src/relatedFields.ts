import { createResourceSaga } from '@thorgate/create-resource-saga';
import { Resource } from 'tg-resources';

import { FetchRelatedField, FetchRelatedFields } from './types';


/*
Plan:

- Validate field type: resource object or idKwarg
- Compile `yield all();` to get all data at the same time, maybe I can leverage `create-resource-saga` correctly
- Replace data in original response
 */

export const isRelatedFieldObject = (value: any): value is FetchRelatedField<any> => (
    value && (
        value.idKwarg && typeof (value.idKwarg as any) === 'string'
    ) && (
        value.resource && value.resource instanceof Resource
    )
);


export const createRelatedFetchSaga = <
    Data,
    Klass extends Resource
>(relatedFields: FetchRelatedFields<Data, Klass>, lazy: boolean = false) => {

};
