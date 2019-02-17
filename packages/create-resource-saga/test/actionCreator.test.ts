import { getType } from 'typesafe-actions';

import { getResourceType } from '../src';
import { actions, actionTypeNoMeta, actionTypeWithMeta, resourceType } from './utils';


describe('createResourceAction', () => {
    test('getResourceType', () => {
        const resourceTypeCheck = getResourceType(actions.noMeta);
        expect(resourceTypeCheck).toBe(resourceType);
    });

    test('empty action call', () => {
        const action = actions.noMeta();
        expect(action).toEqual({
            type: actionTypeNoMeta,
            resourceType,
            payload: {},
        });
    });

    test('payload parameter', () => {
        const action = actions.noMeta({ kwargs: { pk: 1 } });
        expect(action).toEqual({
            type: actionTypeNoMeta,
            resourceType,
            payload: { kwargs: { pk: 1 } },
        });
    });

    test('with meta options', () => {
        const action = actions.withMeta();
        expect(action).toEqual({
            type: actionTypeWithMeta,
            resourceType,
            payload: {},
            meta: 'META',
        });
    });

    test('typesafe-actions compatibility', () => {
        const actionType = getType(actions.noMeta);
        expect(actionType).toBe(actionTypeNoMeta);
    });

    test('redux-actions compatibility', () => {
        expect(actions.noMeta.toString()).toBe(actionTypeNoMeta);
    });
});
