import { SagaResource } from '@tg-resources/redux-saga-router';
import { ActionPayload } from '@thorgate/create-resource-saga';
import { DummyResource } from '@thorgate/test-resource';
import { ConfigureStore, configureStore } from '@thorgate/test-store';
import { delay } from 'redux-saga/effects';
import { NetworkError } from 'tg-resources';

import { createFormSaveSaga, createSaveAction, defaultMessages, SaveMeta, SaveSaga } from '../src';


function testReducer(state: any = null, action: any) {
    switch (action.type) {
        case 'SET_RESPONSE':
            return action.data;

        default:
            return state;
    }
}

const saveAction = createSaveAction('SAVE_FORM');

let store: ConfigureStore<any>;

beforeEach(() => {
    store = configureStore(testReducer);
});


const expectSaveResponse = async (
    saveSaga: SaveSaga<any, any, any, any, any>,
    payload: ActionPayload<any>,
    meta: SaveMeta<any>,
    data: any = null
) => {
    await store.sagaMiddleware.run(saveSaga, null, saveAction(payload, meta)).toPromise();

    if (data) {
        expect((meta.setErrors as any).mock.calls).toEqual([]);
        expect((meta.setStatus as any).mock.calls).toEqual([]);

        expect(store.getState()).toEqual(data);
    }

    expect((meta.setSubmitting as any).mock.calls).toEqual([[false]]);
};

const createActions = () => ({
    setErrors: jest.fn(),
    setStatus: jest.fn(),
    setSubmitting: jest.fn(),
});

describe('createFormSaveSaga works', () => {
    test('missing effect or hook', async () => {
        const actions = createActions();

        const saveSaga = createFormSaveSaga({
            successHook: (_0, _1) => null,
        });

        await expectSaveResponse(saveSaga, {
            data: {},
        }, actions);

        expect(actions.setStatus.mock.calls).toEqual([
            [{ message: 'Error: Misconfiguration: "resource" or "apiFetchHook" is required' }],
        ]);
    });

    test('with SagaResouce', async () => {
        const resource = new SagaResource('/test', null, DummyResource);
        resource.resource.Data = {
            success: true,
        };

        const actions = createActions();

        function successHook(response: any) {
            expect(response).toEqual({ success: true });
            store.dispatch({ type: 'SET_RESPONSE', data: response });
        }

        const saveSaga = createFormSaveSaga({
            resource,
            successHook,
        });

        await expectSaveResponse(saveSaga, {
            data: {},
        }, actions, {
            success: true,
        });
    });

    test('timeout handling', async () => {
        const actions = createActions();

        function* apiSaveHook(_0: any) {
            yield delay(100);
        }

        const saveSaga = createFormSaveSaga({
            successHook: (_0, _1) => null,
            apiSaveHook,
            timeoutMs: 10,
        });

        await expectSaveResponse(saveSaga, { data: {} }, actions);

        expect(actions.setStatus.mock.calls).toEqual([
            [{ message: 'Error: Timeout reached, form save failed' }],
        ]);
    });
});


describe('default error handler', () => {
    test('Network error w/ custom messages', async () => {
        const resource = new SagaResource('/test', null, DummyResource);
        resource.resource.Error = new NetworkError('Network error');

        const actions = createActions();

        const saveSaga = createFormSaveSaga({
            resource,
            successHook: (_0, _1) => null,
            messages: {
                network: 'Network error yo',
                invalidResponseCode: '',
            }
        });

        await expectSaveResponse(saveSaga, { data: {} }, actions);

        expect(actions.setStatus.mock.calls).toEqual([[{
            message: 'Network error yo',
        }]]);
    });

    test('Network error', async () => {
        const resource = new SagaResource('/test', null, DummyResource);
        resource.resource.Error = new NetworkError('Network error');

        const actions = createActions();

        const saveSaga = createFormSaveSaga({
            resource,
            successHook: (_0, _1) => null,
        });

        await expectSaveResponse(saveSaga, {
            data: {},
        }, actions);

        expect(actions.setStatus.mock.calls).toEqual([[{
            message: defaultMessages.network,
        }]]);
    });

    test('InvalidResponseCode error', async () => {
        const resource = new SagaResource('/test', {
            statusSuccess: 400,
        }, DummyResource);
        resource.resource.Data = {};

        const actions = createActions();

        const saveSaga = createFormSaveSaga({
            resource,
            successHook: (_0, _1) => null,
        });

        await expectSaveResponse(saveSaga, { data: {} }, actions);

        expect(actions.setStatus.mock.calls).toEqual([[{
            message: defaultMessages.invalidResponseCode,
        }]]);
    });

    test('ValidationError', async () => {
        const resource = new SagaResource('/test', {
            statusSuccess: 400,
            statusValidationError: 200,
        }, DummyResource);
        resource.resource.Data = {
            errors: {
                non_field_errors: [
                    'Something is generally broken',
                ],

                password: [
                    'too short',
                    'missing numbers',
                ],

                email: {
                    something: 'be wrong yo',
                },

                remember: false,
            },
        };

        const actions = createActions();

        const saveSaga = createFormSaveSaga({
            resource,
            successHook: (_0, _1) => null,
        });

        await expectSaveResponse(saveSaga, { data: {} }, actions);

        expect(actions.setStatus.mock.calls).toEqual([[{
            message: 'Something is generally broken',
        }]]);

        expect(actions.setErrors.mock.calls).toEqual([[{
            email: {
                something: 'be wrong yo',
            },
            password: 'too short missing numbers',
            remember: 'false'
        }]]);
    });
});
