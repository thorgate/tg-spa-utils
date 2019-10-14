import { defaultMessages } from './messages';
import { FormSagaConfig } from './types';

const config: FormSagaConfig = {
    timeoutMessage: 'Timeout reached, form save failed',
    messages: defaultMessages,
};

export function setFormSagaConfig<K extends keyof FormSagaConfig>(
    key: K,
    value: FormSagaConfig[K]
) {
    config[key] = value;
}

export function getFormSagaConfig<K extends keyof FormSagaConfig>(
    key: K
): FormSagaConfig[K] {
    return config[key];
}
