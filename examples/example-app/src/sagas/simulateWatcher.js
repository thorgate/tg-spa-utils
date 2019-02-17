import { delay } from 'redux-saga/effects';


export default function* simulateWatcher() {
    console.log('started watcher');

    while (true) {
        console.log('ping');

        yield delay(10000);
        console.log('pong');
    }
}
