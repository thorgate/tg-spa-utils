import { createResourceAction, ResourceActionPayload } from '@thorgate/create-resource-saga';
import { Kwargs } from '@thorgate/spa-is';

import { DeleteMeta, FormsResource, SaveMeta, StatusMessage } from './types';


export const setErrorsNoop = (_0: any) => null;
export const setSubmittingNoop = (_0: boolean) => null;


/**
 * Action creator matching signature:
 *
 *   (payload, formikActions) => ({ type, resourceType, payload, formikActions })
 *
 * @param type - Action type
 * @param setStatus - Default setStatus handler
 */
export const createDeleteAction = <
    T extends string, Values, KW extends Kwargs<KW> = {}
>(type: T, setStatus?: (status?: StatusMessage) => any) => (
    createResourceAction(FormsResource, type, (resolve) => (
        (payload: ResourceActionPayload<KW, Values>, meta?: DeleteMeta<Values>) => {
            let setStatusHandler: (status?: StatusMessage) => any;
            if (meta) {
                setStatusHandler = meta.setStatus;
            } else if (setStatus) {
                setStatusHandler = setStatus;
            } else {
                throw new Error(`Delete action "${type}" misconfiguration. setStatus is required.`);
            }

            return resolve(payload, {
                setStatus: setStatusHandler,
                setErrors: setErrorsNoop,
                setSubmitting: setSubmittingNoop,
            });
        }
    ))
);


/**
 * Action creator matching signature:
 *
 *   (payload, formikActions) => ({ type, resourceType, payload, meta: formikActions })
 *
 * @param type - Action type
 */
export const createSaveAction = <T extends string, Values, KW extends Kwargs<KW> = {}>(type: T) => (
    createResourceAction(FormsResource, type, (resolve) => (
        (payload: ResourceActionPayload<KW, Values>, meta: SaveMeta<Values>) => resolve(payload, meta)
    ))
);
