import React, { ReactNode, SFC } from 'react';
import { Route } from 'react-router';


export interface StatusProps {
    code?: number;
    children?: ReactNode;
}


export const Status: SFC<StatusProps> = ({ code, children }) => (
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
