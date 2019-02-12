import { ActionPayload, ActionType } from '@thorgate/create-resource-saga';
import { Kwargs, Omit, OptionalMap } from '@thorgate/spa-is';
import { FormikProps } from 'formik';
import { match } from 'react-router';
import { SagaIterator } from 'redux-saga';


export type SaveMeta<Values> =
    Pick<FormikProps<Values>, 'setErrors' | 'setStatus' | 'setSubmitting'> &
    OptionalMap<Omit<FormikProps<Values>, 'setErrors' | 'setStatus' | 'setSubmitting'>>;


export type SaveActionType<
    T extends string,
    Values,
    KW extends Kwargs<KW> = {}
> = ActionType<T, SaveMeta<Values>, KW, Values>;


export interface SaveAction<T extends string, Values, KW extends Kwargs<KW> = {}> {
    (payload: ActionPayload<KW, Values>, meta: SaveMeta<Values>): ActionType<T, SaveMeta<Values>, KW, Values>;

    getType?: () => T;
}


export type SaveSaga<
    T extends string,
    Values,
    KW extends Kwargs<KW> = {},
    Params extends Kwargs<Params> = {},
> = (matchObj: match<Params> | null, action: ActionType<T, SaveMeta<Values>, KW, Values>) => SagaIterator;
