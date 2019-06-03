import { ResourceSagaConfig } from './types';


const config: ResourceSagaConfig = {
    timeoutMessage: 'Timeout reached, resource saga failed',
    timeoutMs: 3000,
};

export function setBaseConfig<K extends keyof ResourceSagaConfig>(key: K, value: ResourceSagaConfig[K]) {
    config[key] = value;
}


export function getBaseConfig<K extends keyof ResourceSagaConfig>(key: K): ResourceSagaConfig[K] {
    return config[key];
}
