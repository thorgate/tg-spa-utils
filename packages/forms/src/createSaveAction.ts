import { ActionPayload, Kwargs } from '@thorgate/create-resource-saga';
import { createStandardAction } from 'typesafe-actions';

import { SaveAction, SaveMeta } from './types';


export const createSaveAction = <
    T extends string, Values, KW extends Kwargs<KW> = {}
>(type: T): SaveAction<T, Values, KW> => (
    createStandardAction(type).map(
        (payload: ActionPayload<KW, Values>, meta: SaveMeta<Values>) => ({
            payload, meta,
        })
    )
);
