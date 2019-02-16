import { SagaIterator } from 'redux-saga';
import { call } from 'redux-saga/effects';
import {
    InvalidResponseCode,
    ListValidationError,
    NetworkError,
    SingleValidationError,
    ValidationErrorInterface,
    ValidationErrorType,
} from 'tg-resources';

import { defaultMessages } from './messages';
import { FormErrorHandlerOptions, NestedErrorType } from './types';


const isValidationError = (error: any): error is ValidationErrorInterface => (
    error.isValidationError
);

const isStatusCodeError = (error: any): error is InvalidResponseCode => (
    error.isInvalidResponseCode
);

const isNetworkError = (error: any): error is NetworkError => (
    error.isNetworkError
);


interface ErrorMapping {
    field: string;
    error: ValidationErrorType;
}


export function reduceNestedErrors(error: ValidationErrorType): NestedErrorType {
    if (!error || !error.hasError()) {
        return null;
    }

    if (error instanceof SingleValidationError) {
        return error.toString();
    }

    if (error instanceof ListValidationError) {
        return error.errors.map(reduceNestedErrors);
    }

    const errors: ValidationErrorInterface[] = Object.values(error.errors);

    return errors
        .map((e: ValidationErrorInterface) => ({ field: e.fieldName, error: e }))
        .reduce((result: any, current: any) => {
            result[current.field] = reduceNestedErrors(current.error);
            return result;
        }, {} as NestedErrorType);
}


export function* formErrorsHandler<Values>(options: FormErrorHandlerOptions<Values>): SagaIterator {
    const { error, messages = defaultMessages, setErrors, setStatus } = options;

    if (isNetworkError(error)) {
        yield call(setStatus, {
            message: messages.network,
        });

    } else if (isStatusCodeError(error)) {
        yield call(setStatus, {
            message: messages.invalidResponseCode,
        });

    } else if (isValidationError(error)) {
        const { nonFieldErrors } = error.errors;

        if (nonFieldErrors) {
            yield call(setStatus, {
                message: nonFieldErrors.toString(),
            });
        }

        const fields = error.errors
            .filter((e: ValidationErrorInterface) => e.fieldName !== 'nonFieldErrors')
            .map((e: ValidationErrorInterface) => ({ field: e.fieldName, error: e }))
            .reduce((result: any, current: ErrorMapping) => {
                const currentError = reduceNestedErrors(current.error);

                if (currentError === null) {
                    return;
                }

                result[current.field] = currentError;
                return result;
            }, {});

        yield call(setErrors, fields);
    } else {
        // Fallback to status error
        yield call(setStatus, {
            message: `${error}`,
        });
    }
}
