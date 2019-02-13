import React, { Component, ErrorInfo, ReactNode } from 'react';

import { DefaultFallback, ErrorComponent, ErrorComponentProps } from './DefaultFallbackComponent';
import { ErrorResponse, ErrorType } from './errorReducer';


type ErrorStateType = Pick<ErrorComponentProps, 'error' | 'errorInfo'> | null;

export type ComponentErrorCallback = (error: ErrorResponse, errorInfo: ErrorInfo) => void;

export interface ErrorBoundaryProps {
    onComponentError?: ComponentErrorCallback;
    children: ReactNode;
    ErrorHandler?: ErrorComponent;
    error?: ErrorType;
    ignoreStatusCodes?: number[];
}


interface ErrorBoundaryState {
    error: ErrorStateType;
}


export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    public static defaultProps = {
        ignoreStatusCodes: [401, 403, 404],
        error: null,
    };

    public state: ErrorBoundaryState = {
        error: null,
    };

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Catch errors in any components below and re-render with error message
        this.onError(error, errorInfo);
    }

    public onError = (error: Error, errorInfo: ErrorInfo) => {
        this.setState({ error: { error, errorInfo } });

        if (this.props.onComponentError) {
            this.props.onComponentError(error, errorInfo);
        }
    };

    public resetError = () => {
        this.setState({ error: null });
    };

    public render() {
        const { children, error, ignoreStatusCodes } = this.props;
        const ErrorHandler = this.props.ErrorHandler || DefaultFallback;

        if (this.state.error) {
            return (
                <ErrorHandler
                    error={this.state.error.error}
                    errorInfo={this.state.error.errorInfo}
                    resetError={this.resetError}
                />
            );
        }

        const validErrorWithStatus = (
            error && error.statusCode && !(ignoreStatusCodes as number[]).includes(error.statusCode)
        );

        if (error || validErrorWithStatus) {
            return (
                <ErrorHandler error={error as ErrorResponse} />
            );
        }

        return children;
    }
}
