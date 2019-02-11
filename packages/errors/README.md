# `@thorgate/spa-errors`

> Error handling helpers used by [Thorgate project template SPA variant](https://gitlab.com/thorgate-public/django-project-template/tree/spa)

## ErrorBoundary
ErrorBoundary component allows to prevent whole app from crashing on error and can show 
comprehensive error message instead. Consider using [view](../view/README.md) package instead
of using this directly.

```javascript
import { ErrorBoundary } from '@thorgate/spa-errors';

const App = ({ history, route }) => (
    <ErrorBoundary>
        <SomeComponentThatMightFail />
    </ErrorBoundary>
);
```


## Saving error information into Redux state
This package also provides errorReducer, to use as a common way of saving error information into redux state. 

Add error reducer into your `reducer.js` as part of root (or any other) reducer:
```javascript
import { errorReducer } from '@thorgate/spa-errors'
import { combineReducers } from 'redux';

export default (history) => combineReducers({
    error: errorReducer,
    otherStuff: someOtherReducer,
});
```

Then, use in sagas like this:
```javascript
import { call, put } from 'redux-saga/effects';
import { errorActions } from '@thorgate/spa-errors';

export function* TheSagaOfBjorn() {
    try {
        yield put(errorActions.resetError());
        
        // Do useful stuff here
        yield call(reachValhalla)
    } catch (err) {
        yield put(errorActions.setError(err));
    }
}
```

And provide error information in connected components:
```javascript
import React from 'react';
import { connect } from 'react-redux';
import { getError } from '@thorgate/spa-errors';

const BaseErrorInformation = ({error}) => {
    return error ? (
        <div className="error">Bjôrn failed to reach Valhalla: {error.statusCode}.</div>
    ) : null;
};

BaseErrorInformation.defaultProps = {
    error: null,
};

const mapStateToProps = (state) => ({
    error: getError(state),
});

export const ErrorInformation = connect(mapStateToProps)(BaseErrorInformation);

```
