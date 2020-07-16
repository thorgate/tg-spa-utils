# `@thorgate/spa-forms`

> Helper for creating [Redux-Saga](https://github.com/redux-saga/redux-saga)s for saving forms

Typical use-case is with forms done using [Formik](https://github.com/jaredpalmer/formik).

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
    method: 'patch', // Optional. Without this the 'POST' request will be made. Complete list of allowed values is fetch, head, options, post, patch, put, del.
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

Alternatively, if the API endpoint you are using containts some variables in its path and you need to populate them you can do something like that (if `pk` is the variable that needs to be replaced):

```js
...

export const ComponentForm = connect()(withFormik({
    ...
    
    handleSubmit: (values, { props, ...formik }) => (
        props.dispatch(saveForm({ data: values, kwargs: { pk: props.somevalue } }, formik))
    ),
})(Component));

```

saveForm also accepts `query: {}` and `attachments: []` as arguments.


In case you can't or don't want to use formik, you can also pass error handling functions to the action creator. Anything passed with the action will override these. Note that `setStatus` must be provided in at least one way.

```
const setStatus = (status) => console.log(status);
export const saveForm = createSaveAction('@@sagas/form/SAVE', { setStatus });
```
