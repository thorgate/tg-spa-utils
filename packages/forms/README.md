# `@thorgate/forms`

> Helper for creating [Redux-Saga](https://github.com/redux-saga/redux-saga)s for saving forms

Typical use-case is with forms done using Formik.

## Usage

Create a saga for saving your form using the helper:
```js
import { createSaveAction, createFormSaveSaga, formErrorsHandler } from '@thorgate/spa-forms';
import { call, takeLatest } from 'redux-saga/effects';

import api from 'services/api';


export const saveForm = createSaveAction('@@sagas/form/SAVE');


function* errorHook(options) {
    yield call(formErrorsHandler, options);

    // Field errors, error status and messages are now set, do other stuff here if necessary
}


function successHook(params, payload, result, { setStatus }) {
    setStatus({ success: true });
}


const saveFormSaga = createFormSaveSaga({
    resource: api.user.forgotPasswordToken,
    successHook,
    errorHook, // Optional
});


export default function* formWatcherSaga() {
    yield takeLatest('@@sagas/form/SAVE', saveFormSaga, null);
}
```

Use the saga you created as watcher saga for the view. Pass the action creator as handleSubmit prop to withFormik:

```js
import { connect } from 'react-redux';
import { withFormik } from 'formik';
import { saveForm } from 'sagas/form/saveFormSaga';

...

export const ComponentForm = connect()(withFormik({
    ...
    
    handleSubmit: (values, { props, ...formik }) => (
        props.dispatch(saveForm({ data: values }, formik))
    ),
})(Component));

```

In case you can't or don't want to use formik, you can also pass error handling functions to the action creator. Anything passed with the action will override these. Note that `setStatus` must be provided in at least one way.

```
const setStatus = (status) => console.log(status);
export const saveForm = createSaveAction('@@sagas/form/SAVE', { setStatus });
```
