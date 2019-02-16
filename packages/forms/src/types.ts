import { ActionPayload, ResourceActionType, ResourceSagaOptions } from '@thorgate/create-resource-saga';
import { Kwargs, Omit, OptionalMap } from '@thorgate/spa-is';
import { FormikErrors, FormikProps } from 'formik';
import { match } from 'react-router';
import { SagaIterator } from 'redux-saga';
import { Resource, ResourceErrorInterface, ResourcePostMethods } from 'tg-resources';


export interface StatusMessage {
    message?: string;

    [key: string]: any;
}


export interface ErrorMessages {
    network: string;
    invalidResponseCode: string;
}

export interface FormErrorHandlerOptions<Values> {
    setErrors: (errors: FormikErrors<Values>) => void | SagaIterator;
    setStatus: (status?: StatusMessage) => void | SagaIterator;

    /**
     * Error occurred in Save processing saga.
     */
    error: ResourceErrorInterface | Error;

    /**
     * Error messages.
     */
    messages?: ErrorMessages;
}

export interface NestedError {
    [key: string]: null | string | NestedError[] | NestedError;
}

export type NestedErrorType = string | null | NestedError;


export type SaveMeta<Values> =
    Pick<FormikProps<Values>, 'setErrors' | 'setStatus' | 'setSubmitting'> &
    OptionalMap<Omit<FormikProps<Values>, 'setErrors' | 'setStatus' | 'setSubmitting'>>;


export type DeleteMeta<Values> =
    Pick<FormikProps<Values>, 'setStatus'> &
    OptionalMap<Omit<FormikProps<Values>, 'setStatus'>>;


export type SaveActionType<
    T extends string,
    Values,
    KW extends Kwargs<KW> = {}
> = ResourceActionType<T, SaveMeta<Values>, KW, Values>;


export interface DeleteAction<T extends string, Values, KW extends Kwargs<KW> = {}> {
    (payload: ActionPayload<KW, Values>, meta?: DeleteMeta<Values>): ResourceActionType<T, SaveMeta<Values>, KW, Values>;

    getType?: () => T;
}

export interface SaveAction<T extends string, Values, KW extends Kwargs<KW> = {}> {
    (payload: ActionPayload<KW, Values>, meta: SaveMeta<Values>): ResourceActionType<T, SaveMeta<Values>, KW, Values>;

    getType?: () => T;
}

export interface CreateFormSaveSagaOptions<
    Values,
    T extends string,
    Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {}
> extends Omit<
    ResourceSagaOptions<T, Klass, SaveMeta<Values>, KW, Params, Values>, 'apiHook' | 'timeoutMessage' | 'successHook' | 'method'
> {
    /**
     * tg-resource method to call `resource` with.
     *   **Notice:** by default only POST like methods are supported. For more special configurations use `apiSaveHook`.
     */
    method?: ResourcePostMethods;

    /**
     * Api Save hook. This option is used when `resource` option is not provided.
     *
     * @param matchObj
     * @param action
     */
    apiSaveHook?: (matchObj: match<Params> | null, action: SaveActionType<T, Values, KW>) => (any | SagaIterator);

    /**
     * Successful request handler. This is only called when saving was successful, e.g resource or apiSaveHook did not throw any errors.
     *
     * @param result
     * @param matchObj
     * @param action
     */
    successHook: (result: any, matchObj: match<Params> | null, action: SaveActionType<T, Values, KW>) => (any | SagaIterator);

    /**
     * Error handler called when `resource` or `apiSaveHook` throws any error.
     *
     * @param options
     */
    errorHook?: (options: FormErrorHandlerOptions<Values>) => (void | SagaIterator);

    /**
     * Error messages.
     */
    messages?: ErrorMessages;
}

export type CreateFormSaveSagaReconfigureOptions<
    Values,
    T extends string,
    Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {}
> = Partial<Omit<CreateFormSaveSagaOptions<Values, T, Klass, KW, Params>, 'messages'>>;


export interface SaveSaga<
    T extends string,
    Values,
    Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {}
> {
    (matchObj: match<Params> | null, action: ResourceActionType<T, SaveMeta<Values>, KW, Values>): SagaIterator;

    cloneSaga: <T0 extends string>(
        config: CreateFormSaveSagaReconfigureOptions<Values, T0, Klass, KW, Params>
    ) => SaveSaga<T0, Values, Klass, KW, Params>;
}
