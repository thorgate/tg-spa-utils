import React, { FC, ReactNode } from 'react';


export interface MessagePanelProps {
    title?: string;
    description?: string | ReactNode;
    children?: ReactNode;
}


export const MessagePanel: FC<MessagePanelProps> = ({ title, description, children }) => (
    <div className="message-panel-wrapper">
        <div className="message-panel">
            {title ? (
                <h1>{title}</h1>
            ) : null}
            {description ? (
                <p className="text-muted">{description}</p>
            ) : null}
            {children}
        </div>
    </div>
);
