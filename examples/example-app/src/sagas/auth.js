import { isAuthenticated, userActions } from '@thorgate/spa-permissions';
import { delay, put, select } from 'redux-saga/effects';
import { InvalidResponseCode } from 'tg-resources';


export function* simulateLoading() {
    yield delay(3000);
}

export function* simulateLogin() {
    console.log('Starting login simulation');
    yield delay(300);
    yield put(userActions.setUser({id: 1, username: 'FooBar', email: 'foobar@example.com'}, true));
    console.log('Logged in');
}

export function* simulateLogout() {
    console.log('Starting logout simulation');
    yield delay(300);
    yield put(userActions.resetUser());
    console.log('Logged out');
}


export function* simulateApiError() {
    yield delay(30);

    const loggedIn = yield select(isAuthenticated);

    if (!loggedIn) {
        throw new InvalidResponseCode(401);
    }
}
