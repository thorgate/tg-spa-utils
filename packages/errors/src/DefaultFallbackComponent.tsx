import { PageError } from '@thorgate/spa-components';
import React, { ComponentClass, ComponentType, ErrorInfo, FC, Fragment } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { ErrorResponse } from './errorReducer';


export interface ErrorComponentProps {
    error: ErrorResponse;
    errorInfo?: ErrorInfo;
    resetError?: () => void;
}

export type ErrorComponent = ComponentType<ErrorComponentProps>;


const DefaultErrorHandler: FC<ErrorComponentProps & RouteComponentProps> = ({ error, errorInfo, resetError, history }) => (
    <PageError statusCode={error.statusCode || 500}>
        <div>{error.message}</div>
        {process.env.NODE_ENV !== 'production' ? (
            <Fragment>
                {errorInfo ? <pre>{errorInfo.componentStack}</pre> : null}
                <pre>{error.stack}</pre>
            </Fragment>
        ) : null}
        <button onClick={() => history.goBack()}>
            Go back
        </button>
        &nbsp;or&nbsp;
        {resetError ? (
            <button onClick={() => resetError()}>
                Try again
            </button>
        ) : (
            <button onClick={() => window.location.reload()}>
                Reload the page
            </button>
        )}
    </PageError>
);


export const DefaultFallback: ComponentClass<ErrorComponentProps> = withRouter(DefaultErrorHandler);
