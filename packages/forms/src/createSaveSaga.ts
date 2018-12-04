import { resourceEffectFactory, SagaResource } from '@tg-resources/redux-saga-router';
import { Omit, OptionalMap } from '@thorgate/spa-is';
import { FormikActions } from 'formik';
import { call, delay, race } from 'redux-saga/effects';
import { Attachments, Query, Resource, ResourcePostMethods } from 'tg-resources';
import actionCreatorFactory, { Action, ActionCreator } from 'typescript-fsa';

import { FormErrorHandlerOptions, formErrorsHandler } from './formErrors';
import { defaultMessages, ErrorMessages } from './messages';


const actionFactory = actionCreatorFactory('@@tg-spa-forms-save');


type PayloadActions<Values> =
    Pick<FormikActions<Values>, 'setErrors' | 'setStatus' | 'setSubmitting'> &
    OptionalMap<Omit<FormikActions<Values>, 'setErrors' | 'setStatus' | 'setSubmitting'>>;


export interface ActionPayload<Values, Params extends { [K in keyof Params]?: string | undefined; } = {}> {
    data: Values;
    kwargs?: Params | null;
    actions: PayloadActions<Values>;

    attachments?: Attachments | null;
    query?: Query | null;
}

export const createSaveAction = <
    Values, Params extends { [K in keyof Params]?: string | undefined; } = {}
>(type: string): ActionCreator<ActionPayload<Values, Params>> => (
    actionFactory<ActionPayload<Values, Params>>(type)
);

export interface CreateFormSaveSagaOptions<
    Values,
    Klass extends Resource,
    Params extends { [K in keyof Params]?: string | undefined; } = {}
> {
    resource?: Klass | SagaResource<Klass>;
    method?: ResourcePostMethods;

    apiSaveHook?: (action: Action<ActionPayload<Values, Params>>) => any | Iterator<any>;
    successHook: (result: any, action: Action<ActionPayload<Values, Params>>) => any | Iterator<any>;
    errorHook?: (options: FormErrorHandlerOptions<Values>) => void | Iterator<any>;

    messages?: ErrorMessages;
    timeoutMs?: number;
}


export const DEFAULT_TIMEOUT = 3000;


export const createFormSaveSaga = <
    Values, Klass extends Resource, Params extends { [K in keyof Params]?: string | undefined; } = {}
>(options: CreateFormSaveSagaOptions<Values, Klass, Params>) => {
    const {
        resource,
        method = 'post',
        apiSaveHook,
        errorHook = formErrorsHandler,
        messages = defaultMessages,
        successHook,
        timeoutMs = DEFAULT_TIMEOUT,
    } = options;

    return function* handleFormSave(action: Action<ActionPayload<Values, Params>>) {
        const { actions } = action.payload;

        try {
            let fetchEffect: any;

            if (resource) {
                fetchEffect = resourceEffectFactory(resource, method, {
                    kwargs: action.payload.kwargs,
                    query: action.payload.query,
                    data: action.payload.data,
                    attachments: action.payload.attachments,
                    requestConfig: { initializeSaga: false }, // Disable initialized saga in this context
                });

            } else if (apiSaveHook) {
                fetchEffect = call(apiSaveHook, action);
            } else {
                throw new Error(`Misconfiguration: "resource" or "apiFetchHook" is required formSaveSaga`);
            }

            const { response, timeout } = yield race({
                timeout: delay(timeoutMs, true),
                response: fetchEffect,
            });

            if (timeout) {
                throw new Error('Timeout reached, form save failed');
            }

            if (successHook) {
                yield call(successHook, response, action);
            }

        } catch (error) {
            yield call(errorHook, {
                messages,
                error,
                setErrors: actions.setErrors,
                setStatus: actions.setStatus,
            });

        } finally {
            actions.setSubmitting(false);
        }
    };
};
