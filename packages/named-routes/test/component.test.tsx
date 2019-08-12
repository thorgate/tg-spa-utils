import { cleanup, fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import { buildUrlCache } from '../src';
import { routes, TestApp } from './TestApp';


jest.mock('warning', () => () => null);
beforeEach(() => {
    buildUrlCache(routes);
});
afterEach(cleanup);


describe('Render App with named routes', () => {
    test('render', () => {
        const { getByTestId } = render(
            <TestApp url="/"/>
        );

        expect(getByTestId('page-home').textContent).toEqual('Home');

        fireEvent.click(getByTestId('link-parent'));
        expect(getByTestId('page-parent').textContent).toEqual('Parent page');

        fireEvent.click(getByTestId('link-child'));
        expect(getByTestId('page-parent').textContent).toEqual('Parent page');
        expect(getByTestId('page-child').textContent).toEqual('Child 1');
    });
});
