import 'jest-dom/extend-expect';
import * as React from 'react';
import ReactDOM from 'react-dom';

import { LoadingBar } from '../src';


describe('LoadingBar works', () => {
    afterEach(() => {
        document.getElementsByTagName('html')[0].innerHTML = '';
    });

    test('Simulate=false', () => {
        jest.useFakeTimers();

        const container = document.createElement('div');

        ReactDOM.render(<LoadingBar isLoading={false} simulate={false} />, container);
        ReactDOM.render(<LoadingBar isLoading={true} simulate={false} />, container);
        jest.runOnlyPendingTimers();

        expect(container.querySelector('.tg-loading-bar')!.getAttribute('style'))
            .toMatch(/width: \d+\.(\d)+%; display: block;/);

        ReactDOM.render(<LoadingBar isLoading={false} simulate={false} />, container);
        ReactDOM.render(<LoadingBar isLoading={false} simulate={false} />, container);
        jest.runOnlyPendingTimers();

        expect(container.querySelector('.tg-loading-bar')!.getAttribute('style'))
            .toEqual('width: 0%; display: none;');
    });
});
