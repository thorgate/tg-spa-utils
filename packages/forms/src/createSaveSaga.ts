import {
    createResourceSaga,
    TypeConstant,
} from '@thorgate/create-resource-saga';
import { Kwargs } from '@thorgate/spa-is';
import { match } from 'react-router';
import { call } from 'redux-saga/effects';
import { Resource } from 'tg-resources';

import { getFormSagaConfig } from './configuration';
import { formErrorsHandler } from './formErrors';
import {
    CreateFormSaveSagaOptions,
    CreateFormSaveSagaReconfigureOptions,
    SaveActionType,
    SaveMeta,
    SaveSaga,
} from './types';

export const createFormSaveSaga = <
    Values,
    Klass extends Resource,
    KW extends Kwargs<KW> = Record<string, string | undefined>,
    Params extends Kwargs<Params> = Record<string, string | undefined>
>(
    options: CreateFormSaveSagaOptions<Values, Klass, KW, Params>
): SaveSaga<Values, Klass, KW, Params> => {
    const {
        messages = getFormSagaConfig('messages'),
        ...baseOptions
    } = options;

    function createCloneableSaga(
        config: CreateFormSaveSagaReconfigureOptions<
            Values,
            Klass,
            KW,
            Params
        > = {}
    ) {
        const mergedOptions = { ...baseOptions, ...config };

        const {
            resource,
            method = 'post',
            mutateKwargs,
            mutateQuery,
            apiSaveHook,
            errorHook,
            successHook,
            timeoutMs,
        } = mergedOptions;

        const saga = createResourceSaga<
            Klass,
            KW,
            Params,
            Values,
            SaveMeta<Values>
        >({
            timeoutMessage: getFormSagaConfig('timeoutMessage'),
            resource,
            method,
            mutateKwargs,
            mutateQuery,
            apiHook: apiSaveHook,
            successHook,
            timeoutMs,
        });

        function* formSaveSaga(
            matchObj: match<Params> | null,
            action: SaveActionType<TypeConstant, Values, KW>
        ) {
            if (!(action as any)) {
                throw new Error('Action is required for formSaveSaga');
            }

            try {
                yield call(saga, matchObj, action);
            } catch (error) {
                yield call(errorHook || formErrorsHandler, {
                    messages,
                    error,
                    setErrors: action.meta.setErrors,
                    setStatus: action.meta.setStatus,
                });

                // Help with debugging by logging the error occurred
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.log(error);
                }
            } finally {
                action.meta.setSubmitting(false);
            }
        }

        return Object.assign(formSaveSaga, {
            cloneSaga: (
                override: CreateFormSaveSagaReconfigureOptions<
                    Values,
                    Klass,
                    KW,
                    Params
                > = {}
            ) => createCloneableSaga(override),

            getConfiguration: () => ({ ...mergedOptions, messages, method }),
        });
    }

    return createCloneableSaga();
};
