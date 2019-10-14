import { KeyOptions } from '@thorgate/spa-entities-reducer';
import { match } from 'react-router';

export const mergeKeyOptions = (
    matchObj: match<any> | null = null,
    keyOptions?: KeyOptions
) => Object.assign({}, matchObj ? matchObj.params : {}, keyOptions || {});
