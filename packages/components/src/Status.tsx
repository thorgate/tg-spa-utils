import React, { ReactNode } from 'react';
import { Route } from 'react-router';

export interface StatusProps {
    /**
     * Status code to pass to React-Router staticContext
     */
    code?: number;

    /**
     * React children
     */
    children?: ReactNode;
}

export const Status = ({ code, children }: StatusProps) => (
    <Route
        render={({ staticContext }) => {
            if (staticContext) {
                staticContext.statusCode = code;
            }

            return children;
        }}
    />
);

Status.defaultProps = {
    code: 500,
    children: null,
};
