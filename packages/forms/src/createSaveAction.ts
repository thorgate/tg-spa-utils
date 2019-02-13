import { ActionPayload } from '@thorgate/create-resource-saga';
import { Kwargs } from '@thorgate/spa-is';
import { createAction } from 'typesafe-actions';

import { DeleteAction, DeleteMeta, SaveAction, SaveMeta } from './types';


export const setErrorsNoop = (_0: any) => null;
export const setSubmittingNoop = (_0: boolean) => null;

export const createDeleteAction = <
    T extends string, Values, KW extends Kwargs<KW> = {}
>(type: T, setStatus?: (status?: any) => any): DeleteAction<T, Values, KW> => (
    createAction(type, (resolve) => (
        (payload: ActionPayload<KW, Values>, meta?: DeleteMeta<Values>) => {
            let setStatusHandler: (status?: any) => any;
            if (meta) {
                setStatusHandler = meta.setStatus;
            } else if (setStatus) {
                setStatusHandler = setStatus;
            } else {
                throw new Error(`Delete action "${type}" is misconfiguration. setStatus is required.`);
            }

            return resolve(payload, {
                setStatus: setStatusHandler,
                setErrors: setErrorsNoop,
                setSubmitting: setSubmittingNoop,
            });
        }
    ))
);


export const createSaveAction = <
    T extends string, Values, KW extends Kwargs<KW> = {}
>(type: T): SaveAction<T, Values, KW> => (
    createAction(type, (resolve) => (
        (payload: ActionPayload<KW, Values>, meta: SaveMeta<Values>) => resolve(payload, meta)
    ))
);
