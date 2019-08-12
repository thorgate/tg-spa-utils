import { cleanup, render } from '@testing-library/react';
import * as React from 'react';
import { StaticContext, StaticRouter } from 'react-router';

import { MessagePanel, PageError, Status } from '../src';


afterEach(() => {
    cleanup();
});

describe('SPA components render correctly', () => {
    test('static status works correctly', () => {
        const context: StaticContext = {};

        const { getByText } = render((
            <StaticRouter context={context}>
                <PageError statusCode={403}>
                    <div>
                        Very bad, you should not have come. Meow.
                    </div>
                </PageError>
            </StaticRouter>
        ));

        expect(getByText(/Meow/).textContent).toEqual('Very bad, you should not have come. Meow.');
        expect(context.statusCode).toEqual(403);
    });

    test('description is handled correctly', () => {
        const { getByText } = render((
            <StaticRouter>
                <Status>
                    <MessagePanel title="Error" description="Very bad, you should not have come.">
                        <div>
                            Meow.
                        </div>
                    </MessagePanel>
                </Status>
            </StaticRouter>
        ));

        expect(getByText(/Error/).textContent).toEqual('Error');
        expect(getByText(/Very bad/).textContent).toEqual('Very bad, you should not have come.');
        expect(getByText(/Meow/).textContent).toEqual('Meow.');
    });
});
