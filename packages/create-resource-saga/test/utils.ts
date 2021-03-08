import { createAction } from '@reduxjs/toolkit';

export const resourceType = '@@tg-create-resource-saga-test';
export const actionTypeNoMeta = '@@tg-create-resource-action';
export const actionTypeWithMeta = '@@tg-create-resource-action';

export const actions = {
    noMeta: createAction(actionTypeNoMeta, (payload: any = {}) => ({
        payload,
        meta: undefined,
    })),
    withMeta: createAction(
        actionTypeWithMeta,
        (payload: any = {}, meta = 'META') => ({
            payload,
            meta,
        })
    ),
};
