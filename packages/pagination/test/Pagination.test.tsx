import { act, cleanup, fireEvent, render } from '@testing-library/react';
import {
    paginationActions,
    paginationReducer,
    PaginationActions,
    PaginationState,
} from '@thorgate/spa-pagination-reducer';
import { ConfigureStore, configureStore } from '@thorgate/test-store';
import React from 'react';
import { Provider } from 'react-redux';
import { combineReducers } from 'redux';

import { Pagination } from '../src';


const reducer = combineReducers({
    pagination: paginationReducer,
});


let store: ConfigureStore<PaginationState, PaginationActions>;

beforeEach(() => {
    store = configureStore(reducer);
});
afterEach(cleanup);


describe('<Pagination />', () => {
    test('missing render fn does not fail', () => {
        const callback = jest.fn();

        render((
            <Provider store={store}>
                <Pagination
                    name="test"
                    trigger={callback}
                    render={null as any}
                />
            </Provider>
        ));
    });

    test('render', () => {
        const callback = jest.fn();

        const { getByTestId } = render((
            <Provider store={store}>
                <Pagination
                    name="test"
                    trigger={callback}
                    render={({ loadNext, reload, loadPrev, hasNext, hasPrev }) => (
                        <>
                            <button data-testid="btn-load-next" onClick={loadNext} disabled={!hasNext}>
                                NEXT
                            </button>
                            <button data-testid="btn-reload" onClick={reload}>
                                NEXT
                            </button>
                            <button data-testid="btn-load-prev" onClick={loadPrev} disabled={!hasPrev}>
                                NEXT
                            </button>
                        </>
                    )}
                />
            </Provider>
        ));

        // Expect buttons to be disabled
        expect((getByTestId('btn-load-next') as HTMLButtonElement).disabled).toEqual(true);
        expect((getByTestId('btn-load-prev') as HTMLButtonElement).disabled).toEqual(true);

        act(() => {
            store.dispatch(paginationActions.setNextKwargs('test', { a: 'next' }));
            store.dispatch(paginationActions.setCurrentKwargs('test', { a: 'current' }));
            store.dispatch(paginationActions.setPrevKwargs('test', { a: 'prev' }));
        });

        // Expect button do be enabled
        expect((getByTestId('btn-load-next') as HTMLButtonElement).disabled).toEqual(false);
        expect((getByTestId('btn-load-prev') as HTMLButtonElement).disabled).toEqual(false);

        fireEvent.click(getByTestId('btn-load-next'));
        expect(callback.mock.calls).toEqual([[{ query: { a: 'next' } }]]);
        callback.mockReset();

        fireEvent.click(getByTestId('btn-reload'));
        expect(callback.mock.calls).toEqual([[{ query: { a: 'current' } }]]);
        callback.mockReset();

        fireEvent.click(getByTestId('btn-load-prev'));
        expect(callback.mock.calls).toEqual([[{ query: { a: 'prev' } }]]);
        callback.mockReset();
    });
});
