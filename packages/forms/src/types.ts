import { ResourcePayloadMetaAction, ResourceSagaOptions, StringOrSymbol } from '@thorgate/create-resource-saga';
import { Kwargs, Omit } from '@thorgate/spa-is';
import { FormikErrors, FormikProps } from 'formik';
import { match } from 'react-router';
import { SagaIterator } from 'redux-saga';
import { Resource, ResourceErrorInterface, ResourcePostMethods } from 'tg-resources';


export const FormsResource = '@@thorgate/spa-entities';
export type FormsResourceType = typeof FormsResource;


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


export interface SaveMeta<Values> extends Pick<FormikProps<Values>, 'setErrors' | 'setStatus' | 'setSubmitting'> {
    [key: string]: any;
}

export type SaveActionType<
    T extends StringOrSymbol,
    Values,
    KW extends Kwargs<KW> = {}
> = ResourcePayloadMetaAction<FormsResourceType, T, KW, Values, SaveMeta<Values>>;


export interface CreateFormSaveSagaOptions<
    Values,
    Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {}
> extends Omit<
    ResourceSagaOptions<FormsResourceType, Klass, KW, Params, Values, SaveMeta<Values>>,
    'apiHook' | 'timeoutMessage' | 'successHook' | 'method'
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
    apiSaveHook?: (matchObj: match<Params> | null, action: SaveActionType<StringOrSymbol, Values, KW>) => (any | SagaIterator);

    /**
     * Successful request handler. This is only called when saving was successful, e.g resource or apiSaveHook did not throw any errors.
     *
     * @param result
     * @param matchObj
     * @param action
     */
    successHook: (result: any, matchObj: match<Params> | null, action: SaveActionType<StringOrSymbol, Values, KW>) => (any | SagaIterator);

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
    Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {}
> = Partial<Omit<CreateFormSaveSagaOptions<Values, Klass, KW, Params>, 'messages'>>;


export interface SaveSaga<
    Values,
    Klass extends Resource,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {}
> {
    /**
     * Resource saga to handle sending data to server using formik forms.
     *
     * @param matchObj
     * @param action
     */
    (matchObj: match<Params> | null, action: SaveActionType<StringOrSymbol, Values, KW>): SagaIterator;

    /**
     * Clone configured saga and create new saga with updated values.
     *
     * @param config - Configuration options
     */
    cloneSaga: (
        config: CreateFormSaveSagaReconfigureOptions<Values, Klass, KW, Params>
    ) => SaveSaga<Values, Klass, KW, Params>;

    /**
     * Get currently used resource saga config.
     */
    getConfiguration: () => CreateFormSaveSagaOptions<Values, Klass, KW, Params>;
}
