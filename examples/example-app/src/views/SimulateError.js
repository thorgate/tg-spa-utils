import React, { Fragment } from 'react';

import { withView } from '../withView';


const createError = () => {
    throw new Error('Simulated page error')
};

export default withView(() => (
    <Fragment>
        {createError()}
    </Fragment>
));
