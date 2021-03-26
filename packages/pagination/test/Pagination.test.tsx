import { combineReducers, createAction, createReducer } from '@reduxjs/toolkit';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { createFetchAction } from '@thorgate/spa-entities';
import {
    paginationActions,
    paginationReducer,
    PaginationActions,
    PaginationState,
} from '@thorgate/spa-pagination-reducer';
import { ConfigureStore, configureStore } from '@thorgate/test-store';
import React from 'react';
import { Provider } from 'react-redux';

import { Pagination } from '../src';

const resetTest = createAction('pagination/reset');
const fetchAction = createFetchAction('pagination/test');

const testReducer = createReducer(
    null as ReturnType<typeof fetchAction>['payload'] | null,
    (builder) => {
        builder
            .addCase(fetchAction, (_0, action) => {
                return action.payload;
            })
            .addCase(resetTest, () => {
                return null;
            });
    }
);

const reducer = combineReducers<
    PaginationState & { test: ReturnType<typeof testReducer> },
    PaginationActions | ReturnType<typeof resetTest> | ReturnType<typeof fetchAction>
>({
    pagination: paginationReducer,
    test: testReducer,
});

let store: ConfigureStore<
    PaginationState & { test: ReturnType<typeof testReducer> },
    PaginationActions | ReturnType<typeof resetTest> | ReturnType<typeof fetchAction>
>;

beforeEach(() => {
    store = configureStore(reducer);
});
afterEach(cleanup);

describe('<Pagination />', () => {
    test('missing render fn does not fail', () => {
        render(
            <Provider store={store}>
                <Pagination
                    name="test"
                    trigger={fetchAction}
                    render={null as any}
                />
            </Provider>
        );
    });

    test('render', () => {
        const { getByTestId } = render(
            <Provider store={store}>
                <Pagination
                    name="test"
                    trigger={fetchAction}
                    render={({
                        loadNext,
                        reload,
                        loadPrev,
                        hasNext,
                        hasPrev,
                    }) => (
                        <>
                            <button
                                data-testid="btn-load-next"
                                onClick={loadNext}
                                disabled={!hasNext}
                            >
                                NEXT
                            </button>
                            <button data-testid="btn-reload" onClick={reload}>
                                NEXT
                            </button>
                            <button
                                data-testid="btn-load-prev"
                                onClick={loadPrev}
                                disabled={!hasPrev}
                            >
                                NEXT
                            </button>
                        </>
                    )}
                />
            </Provider>
        );

        // Expect buttons to be disabled
        expect(
            (getByTestId('btn-load-next') as HTMLButtonElement).disabled
        ).toEqual(true);
        expect(
            (getByTestId('btn-load-prev') as HTMLButtonElement).disabled
        ).toEqual(true);

        act(() => {
            store.dispatch(
                paginationActions.setNextKwargs('test', { a: 'next' })
            );
            store.dispatch(
                paginationActions.setCurrentKwargs('test', { a: 'current' })
            );
            store.dispatch(
                paginationActions.setPrevKwargs('test', { a: 'prev' })
            );
        });

        // Expect button do be enabled
        expect(
            (getByTestId('btn-load-next') as HTMLButtonElement).disabled
        ).toEqual(false);
        expect(
            (getByTestId('btn-load-prev') as HTMLButtonElement).disabled
        ).toEqual(false);

        fireEvent.click(getByTestId('btn-load-next'));
        expect(store.getState().test).toEqual({ query: { a: 'next' } });
        store.dispatch(resetTest());

        fireEvent.click(getByTestId('btn-reload'));
        expect(store.getState().test).toEqual({ query: { a: 'current' } });
        store.dispatch(resetTest());

        fireEvent.click(getByTestId('btn-load-prev'));
        expect(store.getState().test).toEqual({ query: { a: 'prev' } });
        store.dispatch(resetTest());
    });
});
