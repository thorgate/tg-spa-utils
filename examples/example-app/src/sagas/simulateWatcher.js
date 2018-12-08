import { delay } from 'redux-saga/effects';


export default function* simulateWatcher() {
    console.log('started watcher');

    while (true) {
        console.log('started');

        yield delay(2000);
    }
}
