import { Action, AnyAction, Store } from 'redux';

import { isLoading, LoadingState } from './loadingReducer';


export const waitForData = <S extends LoadingState, A extends Action = AnyAction>(store: Store<S, A>) => (
    new Promise((resolve) => {
        if (!isLoading(store.getState())) {
            resolve();
            return;
        }

        const unsubscribe = store.subscribe(() => {
            if (!isLoading(store.getState())) {
                unsubscribe();
                resolve();
            }
        });
    })
);
