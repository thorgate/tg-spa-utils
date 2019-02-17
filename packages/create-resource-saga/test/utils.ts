import { createResourceAction } from '../src';


export const resourceType = '@@tg-create-resource-saga-test';
export const actionTypeNoMeta = '@@tg-create-resource-action';
export const actionTypeWithMeta = '@@tg-create-resource-action';


export const actions = {
    noMeta: createResourceAction(resourceType, actionTypeNoMeta, (resolve) => (payload: any = {}) => resolve(payload)),
    withMeta: createResourceAction(resourceType, actionTypeWithMeta, (resolve) => (
        (payload: any = {}, meta: string = 'META') => resolve(payload, meta)
    )),
};
