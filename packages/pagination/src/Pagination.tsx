import { createFetchAction } from '@thorgate/spa-entities';
import { hasRenderPropFn } from '@thorgate/spa-is';
import {
    paginationSelectors,
    PaginationState,
} from '@thorgate/spa-pagination-reducer';
import { ReactElement, useCallback } from 'react';
import { useSelector } from 'react-redux';

export interface PaginationOptions {
    hasNext: boolean;
    hasPrev: boolean;
    loadNext: () => void;
    reload: () => void;
    loadPrev: () => void;
}

export interface PaginationProps {
    name: string;
    trigger: ReturnType<typeof createFetchAction>;
    render: (params: PaginationOptions) => ReactElement;
}

export const Pagination = (props: PaginationProps) => {
    const selectPagination = useCallback(
        (state: PaginationState) => ({
            hasNext: paginationSelectors.selectHasNext(state, props.name),
            nextKwargs: paginationSelectors.selectNextKwargs(state, props.name),
            currentKwargs: paginationSelectors.selectCurrentKwargs(
                state,
                props.name
            ),
            prevKwargs: paginationSelectors.selectPrevKwargs(state, props.name),
            hasPrev: paginationSelectors.selectHasPrev(state, props.name),
        }),
        [props.name]
    );

    const {
        hasNext,
        nextKwargs,
        currentKwargs,
        hasPrev,
        prevKwargs,
    } = useSelector(selectPagination);

    const loadNext = useCallback(() => {
        props.trigger({ query: nextKwargs });
    }, [nextKwargs, props.trigger]);
    const reload = useCallback(() => {
        props.trigger({ query: currentKwargs });
    }, [currentKwargs, props.trigger]);
    const loadPrev = useCallback(() => {
        props.trigger({ query: prevKwargs });
    }, [prevKwargs, props.trigger]);

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
