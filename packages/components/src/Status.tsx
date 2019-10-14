import React, { FC, ReactNode } from 'react';
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

export const Status: FC<StatusProps> = ({ code, children }) => (
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
