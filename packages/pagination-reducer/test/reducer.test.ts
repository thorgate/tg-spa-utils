import { ConfigureStore, configureStore } from '@thorgate/test-store';
import { combineReducers } from 'redux';

import {
    paginationActions,
    paginationReducer,
    paginationSelectors,
    PaginationActions,
    PaginationState,
} from '../src';


const reducer = combineReducers({
    pagination: paginationReducer,
});


let store: ConfigureStore<PaginationState, PaginationActions>;

beforeEach(() => {
    store = configureStore(reducer);
});


describe('reducer works', () => {
    // Selector default values
    test('selectors return default', () => {
        expect(paginationSelectors.selectNextKwargs(store.getState(), 'test')).toEqual(null);
        expect(paginationSelectors.selectCurrentKwargs(store.getState(), 'test')).toEqual(null);
        expect(paginationSelectors.selectPrevKwargs(store.getState(), 'test')).toEqual(null);
        expect(paginationSelectors.selectHasNext(store.getState(), 'test')).toEqual(false);
        expect(paginationSelectors.selectHasPrev(store.getState(), 'test')).toEqual(false);
    });

    // Reset pagination
    test('setNextKwargs :: filled object', () => {
        store.dispatch(paginationActions.setNextKwargs('test', { a: '1' }));
        store.dispatch(paginationActions.setCurrentKwargs('test', { a: '1' }));
        store.dispatch(paginationActions.setPrevKwargs('test', { a: '1' }));
        expect(paginationSelectors.selectNextKwargs(store.getState(), 'test')).toEqual({ a: '1' });
        expect(paginationSelectors.selectCurrentKwargs(store.getState(), 'test')).toEqual({ a: '1' });
        expect(paginationSelectors.selectPrevKwargs(store.getState(), 'test')).toEqual({ a: '1' });

        store.dispatch(paginationActions.resetPagination('test'));
        expect(paginationSelectors.selectNextKwargs(store.getState(), 'test')).toEqual(null);
        expect(paginationSelectors.selectCurrentKwargs(store.getState(), 'test')).toEqual(null);
        expect(paginationSelectors.selectPrevKwargs(store.getState(), 'test')).toEqual(null);
    });

    // Next kwargs
    test('setNextKwargs :: default args', () => {
        store.dispatch(paginationActions.setNextKwargs('test'));
        expect(paginationSelectors.selectNextKwargs(store.getState(), 'test')).toEqual(null);
        expect(paginationSelectors.selectHasNext(store.getState(), 'test')).toEqual(false);
    });
    test('setNextKwargs :: null', () => {
        store.dispatch(paginationActions.setNextKwargs('test', null));
        expect(paginationSelectors.selectNextKwargs(store.getState(), 'test')).toEqual(null);
        expect(paginationSelectors.selectHasNext(store.getState(), 'test')).toEqual(false);
    });
    test('setNextKwargs :: empty object', () => {
        store.dispatch(paginationActions.setNextKwargs('test', {}));
        expect(paginationSelectors.selectNextKwargs(store.getState(), 'test')).toEqual({});
        expect(paginationSelectors.selectHasNext(store.getState(), 'test')).toEqual(false);
    });
    test('setNextKwargs :: filled object', () => {
        store.dispatch(paginationActions.setNextKwargs('test', { a: '1' }));
        expect(paginationSelectors.selectNextKwargs(store.getState(), 'test')).toEqual({ a: '1' });
        expect(paginationSelectors.selectHasNext(store.getState(), 'test')).toEqual(true);
    });

    // Current kwargs
    test('setCurrentKwargs :: default args', () => {
        store.dispatch(paginationActions.setCurrentKwargs('test'));
        expect(paginationSelectors.selectCurrentKwargs(store.getState(), 'test')).toEqual(null);
    });
    test('setCurrentKwargs :: null', () => {
        store.dispatch(paginationActions.setCurrentKwargs('test', null));
        expect(paginationSelectors.selectCurrentKwargs(store.getState(), 'test')).toEqual(null);
    });
    test('setCurrentKwargs :: empty object', () => {
        store.dispatch(paginationActions.setCurrentKwargs('test', {}));
        expect(paginationSelectors.selectCurrentKwargs(store.getState(), 'test')).toEqual({});
    });
    test('setCurrentKwargs :: filled object', () => {
        store.dispatch(paginationActions.setCurrentKwargs('test', { a: '1' }));
        expect(paginationSelectors.selectCurrentKwargs(store.getState(), 'test')).toEqual({ a: '1' });
    });

    // Prev kwargs
    test('setPrevKwargs :: default args', () => {
        store.dispatch(paginationActions.setPrevKwargs('test'));
        expect(paginationSelectors.selectPrevKwargs(store.getState(), 'test')).toEqual(null);
        expect(paginationSelectors.selectHasPrev(store.getState(), 'test')).toEqual(false);
    });
    test('setPrevKwargs :: null', () => {
        store.dispatch(paginationActions.setPrevKwargs('test', null));
        expect(paginationSelectors.selectPrevKwargs(store.getState(), 'test')).toEqual(null);
        expect(paginationSelectors.selectHasPrev(store.getState(), 'test')).toEqual(false);
    });
    test('setPrevKwargs :: empty object', () => {
        store.dispatch(paginationActions.setPrevKwargs('test', {}));
        expect(paginationSelectors.selectPrevKwargs(store.getState(), 'test')).toEqual({});
        expect(paginationSelectors.selectHasPrev(store.getState(), 'test')).toEqual(false);
    });
    test('setPrevKwargs :: filled object', () => {
        store.dispatch(paginationActions.setPrevKwargs('test', { a: '1' }));
        expect(paginationSelectors.selectPrevKwargs(store.getState(), 'test')).toEqual({ a: '1' });
        expect(paginationSelectors.selectHasPrev(store.getState(), 'test')).toEqual(true);
    });
});
