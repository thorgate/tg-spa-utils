import { PageError } from '@thorgate/spa-components';
import React from 'react';

export const DefaultPermissionDenied = () => (
    <PageError
        statusCode={403}
        title="Insufficient permissions"
        description="You don't have permissions to access this page"
    />
);
