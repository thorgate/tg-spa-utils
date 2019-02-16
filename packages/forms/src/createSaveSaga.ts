import { createResourceSaga } from '@thorgate/create-resource-saga';
import { Kwargs } from '@thorgate/spa-is';
import { match } from 'react-router';
import { call } from 'redux-saga/effects';
import { Resource } from 'tg-resources';

import { formErrorsHandler } from './formErrors';
import { defaultMessages } from './messages';
import { CreateFormSaveSagaOptions, CreateFormSaveSagaReconfigureOptions, SaveActionType, SaveSaga } from './types';


export const createFormSaveSaga = <
    Values,
    T extends string,
    Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
>(options: CreateFormSaveSagaOptions<Values, T, Klass, KW, Params>): SaveSaga<T, Values, Klass, KW, Params> => {
    const {
        messages = defaultMessages,
        ...baseOptions
    } = options;

    function createCloneableSaga(config: CreateFormSaveSagaReconfigureOptions<Values, T, Klass, KW, Params> = {}) {
        const configuration = { ...baseOptions, ...config };

        const {
            resource,
            method = 'post',
            mutateKwargs,
            mutateQuery,
            apiSaveHook,
            successHook,
            timeoutMs,
        } = configuration;

        const saga = createResourceSaga({
            timeoutMessage: 'Timeout reached, form save failed',
            resource,
            method,
            mutateKwargs,
            mutateQuery,
            apiHook: apiSaveHook,
            successHook,
            timeoutMs,
        });

        function* formSaveSaga(matchObj: match<Params> | null, action: SaveActionType<T, Values, KW>) {
            if (!(action as any)) {
                throw new Error('Action is required for formSaveSaga');
            }

            try {
                yield call(saga, matchObj, action);

            } catch (error) {
                yield call(config.errorHook || formErrorsHandler, {
                    messages,
                    error,
                    setErrors: action.meta.setErrors,
                    setStatus: action.meta.setStatus,
                });

                // Help with debugging by logging the error occurred
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
            } finally {
                action.meta.setSubmitting(false);
            }
        }

        return Object.assign(
            formSaveSaga, {
                cloneSaga: <T0 extends string>(override: CreateFormSaveSagaReconfigureOptions<Values, T0, Klass, KW, Params> = {}) => (
                    createCloneableSaga(override as CreateFormSaveSagaReconfigureOptions<Values, T, Klass, KW, Params>) as any
                ) as SaveSaga<T0, Values, Klass, KW, Params>
            }
        );
    }

    return createCloneableSaga();
};
