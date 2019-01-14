import { createSaveAction } from '../src';


describe('createSaveAction works', () => {
    test('correct type created', () => {
        const saveAction = createSaveAction('@@tg-spa-forms-save/TEST_DATA');

        const actions = {
            setErrors: () => null,
            setStatus: () => null,
            setSubmitting: () => null,
        };

        expect(saveAction({
            data: {},
        }, actions)).toEqual({
            type: '@@tg-spa-forms-save/TEST_DATA',
            payload: {
                data: {},
            },
            meta: actions,
        });
    });
});
