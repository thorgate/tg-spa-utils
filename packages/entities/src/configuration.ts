import { normalize } from 'normalizr';

import { FetchSagaConfig } from './types';


const config: FetchSagaConfig = {
    serializeData: normalize,
};

export function setFetchSagaConfig<K extends keyof FetchSagaConfig>(key: K, value: FetchSagaConfig[K]) {
    config[key] = value;
}


export function getFetchSagaConfig<K extends keyof FetchSagaConfig>(key: K): FetchSagaConfig[K] {
    return config[key];
}
