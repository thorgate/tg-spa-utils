import {
    createDeleteAction,
    createSaveAction,
    setErrorsNoop,
    setSubmittingNoop,
} from '../src';

describe('createSaveAction works', () => {
    test('correct type created', () => {
        const saveAction = createSaveAction('@@tg-spa-forms-save/TEST_DATA');

        const actions = {
            setErrors: () => null,
            setStatus: () => null,
            setSubmitting: () => null,
        };

        expect(
            saveAction(
                {
                    data: {},
                },
                actions
            )
        ).toEqual({
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

        const deleteAction = createDeleteAction(
            '@@tg-spa-forms-delete/TEST_DATA',
            { setStatus }
        );

        const actions = {
            setStatus,
            setErrors: setErrorsNoop,
            setSubmitting: setSubmittingNoop,
        };

        expect(
            deleteAction({
                data: {},
            })
        ).toEqual({
            type: '@@tg-spa-forms-delete/TEST_DATA',
            payload: {
                data: {},
            },
            meta: actions,
        });
    });

    test('setStatus w/ action', () => {
        const setStatus = (_0?: any) => null;

        const deleteAction = createDeleteAction(
            '@@tg-spa-forms-delete/TEST_DATA'
        );

        const actions = {
            setStatus,
            setErrors: setErrorsNoop,
            setSubmitting: setSubmittingNoop,
        };

        expect(
            deleteAction(
                {
                    data: {},
                },
                { setStatus }
            )
        ).toEqual({
            type: '@@tg-spa-forms-delete/TEST_DATA',
            payload: {
                data: {},
            },
            meta: actions,
        });
    });

    test('uses defaultMeta', () => {
        const setStatus = (_0?: any) => null;
        const setErrors = (_0?: any) => null;
        const setSubmitting = (_0?: any) => null;

        const defaultMeta = { setStatus, setErrors, setSubmitting };

        const deleteAction = createDeleteAction(
            '@@tg-spa-forms-delete/TEST_DATA',
            defaultMeta
        );

        expect(
            deleteAction({
                data: {},
            })
        ).toEqual({
            type: '@@tg-spa-forms-delete/TEST_DATA',
            payload: {
                data: {},
            },
            meta: defaultMeta,
        });
    });

    test('action meta overrides defaultMeta', () => {
        const setStatusDefault = (_0?: any) => null;
        const setErrorsDefault = (_0?: any) => null;
        const setSubmittingDefault = (_0?: any) => null;
        const defaultMeta = {
            setStatus: setStatusDefault,
            setErrors: setErrorsDefault,
            setSubmitting: setSubmittingDefault,
        };

        const deleteAction = createDeleteAction(
            '@@tg-spa-forms-delete/TEST_DATA',
            defaultMeta
        );

        const setStatus = (_0?: any) => null;
        const setErrors = (_0?: any) => null;
        const setSubmitting = (_0?: any) => null;
        const meta = { setStatus, setErrors, setSubmitting };

        expect(
            deleteAction(
                {
                    data: {},
                },
                meta
            )
        ).toEqual({
            type: '@@tg-spa-forms-delete/TEST_DATA',
            payload: {
                data: {},
            },
            meta,
        });
    });

    test('creator throws error for bad config', () => {
        const deleteAction = createDeleteAction(
            '@@tg-spa-forms-delete/TEST_DATA'
        );

        expect(() => {
            deleteAction({ data: {} });
        }).toThrow(
            'Save/delete action "@@tg-spa-forms-delete/TEST_DATA" misconfiguration. setStatus is required.'
        );
    });
});
