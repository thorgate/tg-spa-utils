import { createDeleteAction, createSaveAction, FormsResource, setErrorsNoop, setSubmittingNoop } from '../src';


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
            resourceType: FormsResource,
            type: '@@tg-spa-forms-save/TEST_DATA',
            payload: {
                data: {},
            },
            meta: actions,
        });
    });
});


describe('createDeleteAction works', () => {
    test('setStatus pre-defined', () => {
        const setStatus = (_0?: any) => null;

        const deleteAction = createDeleteAction('@@tg-spa-forms-delete/TEST_DATA', setStatus);

        const actions = {
            setStatus,
            setErrors: setErrorsNoop,
            setSubmitting: setSubmittingNoop,
        };

        expect(deleteAction({
            data: {},
        })).toEqual({
            resourceType: FormsResource,
            type: '@@tg-spa-forms-delete/TEST_DATA',
            payload: {
                data: {},
            },
            meta: actions,
        });
    });

    test('setStatus w/ action', () => {
        const setStatus = (_0?: any) => null;

        const deleteAction = createDeleteAction('@@tg-spa-forms-delete/TEST_DATA');

        const actions = {
            setStatus,
            setErrors: setErrorsNoop,
            setSubmitting: setSubmittingNoop,
        };

        expect(deleteAction({
            data: {},
        }, { setStatus })).toEqual({
            resourceType: FormsResource,
            type: '@@tg-spa-forms-delete/TEST_DATA',
            payload: {
                data: {},
            },
            meta: actions,
        });
    });

    test('creator throws error for bad config', () => {
        const deleteAction = createDeleteAction('@@tg-spa-forms-delete/TEST_DATA');

        expect(() => {
            deleteAction({ data: {} });
        }).toThrow('Delete action "@@tg-spa-forms-delete/TEST_DATA" misconfiguration. setStatus is required.');
    });
});
