import { createResourceAction, ResourceActionPayload } from '@thorgate/create-resource-saga';
import { Kwargs, OptionalMap } from '@thorgate/spa-is';

import { FormsResource, SaveMeta } from './types';


export const setStatusNoop = (_0: any) => null;
export const setErrorsNoop = (_0: any) => null;
export const setSubmittingNoop = (_0: boolean) => null;


/**
 * Action creator matching signature:
 *
 *   (payload, formikActions = {}) => ({ type, resourceType, payload, meta: formikActions })
 *
 * Uses defaultMeta as defaults in place of what formik would give in action.
 * setStatus must be provided in either defaultMeta or action.
 *
 * @param type - Action type
 * @param defaultMeta - Optional object similar to formikActions for error handling, in case formik cannot be used
 */
export const createSaveAction = <
    T extends string, Values, KW extends Kwargs<KW> = {}
>(
    type: T,
    defaultMeta: OptionalMap<SaveMeta<Values>> = {},
) => (
    createResourceAction(FormsResource, type, (resolve) => (
        (payload: ResourceActionPayload<KW, Values>, meta: OptionalMap<SaveMeta<Values>> = {}) => {
            if (!defaultMeta.setStatus && !meta.setStatus) {
                throw new Error(`Save/delete action "${type}" misconfiguration. setStatus is required.`);
            }

            return resolve(payload, {
                setStatus: setStatusNoop,
                setErrors: setErrorsNoop,
                setSubmitting: setSubmittingNoop,
                ...defaultMeta,
                ...meta,
            });
        }
    ))
);

export const createDeleteAction = createSaveAction;
