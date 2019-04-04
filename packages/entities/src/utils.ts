import { isFunction } from '@thorgate/spa-is';
import { match } from 'react-router';

import { Key } from './types';


export const GetKeyValue = (key: Key<any>, matchObj: match<any> | null): string => {
    if (isFunction(key)) {
        return key(matchObj);
    }

    return key;
};
