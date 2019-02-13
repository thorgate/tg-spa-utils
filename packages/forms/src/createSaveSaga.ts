import { SagaResource } from '@tg-resources/redux-saga-router';
import { createResourceSaga } from '@thorgate/create-resource-saga';
import { Kwargs } from '@thorgate/spa-is';
import { match } from 'react-router';
import { SagaIterator } from 'redux-saga';
import { call } from 'redux-saga/effects';
import { Resource, ResourcePostMethods } from 'tg-resources';

import { FormErrorHandlerOptions, formErrorsHandler } from './formErrors';
import { defaultMessages, ErrorMessages } from './messages';
import { SaveActionType, SaveSaga } from './types';


export interface CreateFormSaveSagaOptions<
    Values,
    T extends string,
    Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {}
> {
    resource?: Klass | SagaResource<Klass>;
    method?: ResourcePostMethods;

    apiSaveHook?: (matchObj: match<Params> | null, action: SaveActionType<T, Values, KW>) => (any | SagaIterator);
    successHook: (result: any, matchObj: match<Params> | null, action: SaveActionType<T, Values, KW>) => (any | SagaIterator);
    errorHook?: (options: FormErrorHandlerOptions<Values>) => (void | SagaIterator);

    messages?: ErrorMessages;
    timeoutMs?: number;

    mutateKwargs?: (matchObj: match<Params> | null, action: SaveActionType<T, Values, KW>) => (any | SagaIterator);
    mutateQuery?: (matchObj: match<Params> | null, action: SaveActionType<T, Values, KW>) => (any | SagaIterator);
}


export const createFormSaveSaga = <
    Values,
    T extends string,
    Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {}
>(options: CreateFormSaveSagaOptions<Values, T, Klass, KW, Params>): SaveSaga<T, Values, KW, Params> => {
    const {
        resource,
        method = 'post',
        apiSaveHook,
        errorHook = formErrorsHandler,
        messages = defaultMessages,
        successHook,
        timeoutMs,
        mutateKwargs,
        mutateQuery,
    } = options;

    const resourceSaga = createResourceSaga({
        resource,
        method,
        apiHook: apiSaveHook as any, // Because base resources argument is optional - need to turn this into any
        successHook: successHook as any, // Because base resources argument is optional - need to turn this into any
        timeoutMessage: 'Timeout reached, form save failed',
        timeoutMs,
        mutateKwargs,
        mutateQuery,
    });

    return function* formSaveSaga(matchObj: match<Params> | null, action: SaveActionType<T, Values, KW>) {
        if (!(action as any)) {
            throw new Error('Action is required for formSaveSaga');
        }

        try {
            yield call(resourceSaga, matchObj, action);

        } catch (error) {
            yield call(errorHook, {
                messages,
                error,
                setErrors: action.meta.setErrors,
                setStatus: action.meta.setStatus,
            });

        } finally {
            action.meta.setSubmitting(false);
        }
    };
};
