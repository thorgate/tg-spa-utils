import { ResourceActionCreator } from '@thorgate/create-resource-saga';
import { FetchMeta } from '@thorgate/spa-entities';
import { hasRenderPropFn, Kwargs } from '@thorgate/spa-is';
import {
    paginationSelectors,
    PaginationState,
} from '@thorgate/spa-pagination-reducer';
import { ReactElement, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export interface PaginationOptions {
    hasNext: boolean;
    hasPrev: boolean;
    loadNext: () => void;
    reload: () => void;
    loadPrev: () => void;
}

export interface PaginationProps<
    KW extends Kwargs<KW> = Record<string, string | undefined>,
    Data = any
> {
    name: string;
    trigger: ResourceActionCreator<any, KW, Data, FetchMeta>;
    render: (params: PaginationOptions) => ReactElement;
}

export const Pagination = ({ trigger, name, ...props }: PaginationProps) => {
    const selectPagination = useCallback(
        (state: PaginationState) => ({
            hasNext: paginationSelectors.selectHasNext(state, name),
            nextKwargs: paginationSelectors.selectNextKwargs(state, name),
            currentKwargs: paginationSelectors.selectCurrentKwargs(state, name),
            prevKwargs: paginationSelectors.selectPrevKwargs(state, name),
            hasPrev: paginationSelectors.selectHasPrev(state, name),
        }),
        [name]
    );

    const dispatch = useDispatch();
    const {
        hasNext,
        nextKwargs,
        currentKwargs,
        hasPrev,
        prevKwargs,
    } = useSelector(selectPagination);

    const loadNext = useCallback(() => {
        dispatch(trigger({ query: nextKwargs }));
    }, [nextKwargs, trigger]);
    const reload = useCallback(() => {
        dispatch(trigger({ query: currentKwargs }));
    }, [currentKwargs, trigger]);
    const loadPrev = useCallback(() => {
        dispatch(trigger({ query: prevKwargs }));
    }, [prevKwargs, trigger]);

    if (hasRenderPropFn(props)) {
        return props.render({
            hasNext,
            hasPrev,
            loadNext,
            reload,
            loadPrev,
        });
    }

    if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('Missing render prop');
    }

    return null;
};
