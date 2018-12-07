import { createSaveAction } from '../src';


describe('createSaveAction works', () => {
    test('correct type created', () => {
        const saveAction = createSaveAction('TEST_DATA');

        const actions = {
            setErrors: () => null,
            setStatus: () => null,
            setSubmitting: () => null,
        };

        expect(saveAction({
            actions,
            data: {},
        })).toEqual({
            type: '@@tg-spa-forms-save/TEST_DATA',
            payload: {
                actions,
                data: {},
            },
            meta: undefined,
        });
    });
});
