import { isFunction } from '@thorgate/spa-is';

import { Key, KeyOptions } from './types';

export const GetKeyValue = (
    key: Key,
    keyOptions?: KeyOptions | null
): string => {
    if (isFunction(key)) {
        return key(keyOptions || null);
    }

    return key;
};
