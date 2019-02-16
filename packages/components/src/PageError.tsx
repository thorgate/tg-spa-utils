import React, { FC, ReactNode } from 'react';
import Helmet from 'react-helmet';

import { MessagePanel } from './MessagePanel';
import { Status } from './Status';


export interface PageErrorProps {
    /**
     * Status code
     */
    statusCode?: number;

    /**
     * Page error title
     */
    title?: string;

    /**
     * Page error description
     */
    description?: string | ReactNode | null;

    /**
     * React children
     */
    children?: ReactNode;
}


export const PageError: FC<PageErrorProps> = ({ title, description, children, statusCode }) => (
    <Status code={statusCode}>
        <MessagePanel title={title} description={description}>
            <Helmet title={title} />
            {children}
        </MessagePanel>
    </Status>
);

PageError.defaultProps = {
    statusCode: 500,
    title: 'Something went wrong',
    description: 'The server encountered an internal error and was unable to complete your request.',
    children: null,
};
