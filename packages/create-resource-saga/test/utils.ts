import { createAction } from '@reduxjs/toolkit';

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
