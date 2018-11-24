import { userActions } from '@thorgate/spa-permissions';
import { delay, put } from 'redux-saga/effects';


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
