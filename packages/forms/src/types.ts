import { ActionPayload, ActionType, Kwargs } from '@thorgate/create-resource-saga';
import { Omit, OptionalMap } from '@thorgate/spa-is';
import { FormikProps } from 'formik';


export type SaveMeta<Values> =
    Pick<FormikProps<Values>, 'setErrors' | 'setStatus' | 'setSubmitting'> &
    OptionalMap<Omit<FormikProps<Values>, 'setErrors' | 'setStatus' | 'setSubmitting'>>;


export type SaveActionType<
    T extends string, Values, KW extends Kwargs<KW> = {}
> = ActionType<T, SaveMeta<Values>, KW, Values>;


export interface SaveAction<T extends string, Values, KW extends Kwargs<KW> = {}> {
    (payload: ActionPayload<KW, Values>, meta: SaveMeta<Values>): ActionType<T, SaveMeta<Values>, KW, Values>;

    getType?: () => T;
}
