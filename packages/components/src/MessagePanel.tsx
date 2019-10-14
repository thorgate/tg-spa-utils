import React, { FC, ReactNode } from 'react';

export interface MessagePanelProps {
    /**
     * Message panel title prop
     */
    title?: string;

    /**
     * Message panel description prop
     */
    description?: string | ReactNode;

    /**
     * React children
     */
    children?: ReactNode;
}

export const MessagePanel: FC<MessagePanelProps> = ({
    title,
    description,
    children,
}) => (
    <div className="message-panel-wrapper">
        <div className="message-panel">
            {title ? <h1>{title}</h1> : null}
            {description ? <p className="text-muted">{description}</p> : null}
            {children}
        </div>
    </div>
);
