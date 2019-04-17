import { isFunction } from '@thorgate/spa-is';
import { match } from 'react-router';

import { Key, KeyOptions } from './types';


export const mergeKeyOptions = (matchObj: match<any> | null = null, keyOptions?: KeyOptions) => (
    Object.assign(
        {},
        matchObj ? matchObj.params : {},
        keyOptions || {},
    )
);


export const GetKeyValue = (key: Key, keyOptions?: KeyOptions | null): string => {
    if (isFunction(key)) {
        return key(keyOptions || null);
    }

    return key;
};
