import { FetchAction } from '@thorgate/spa-entities';
import { hasRenderPropFn } from '@thorgate/spa-is';
import {
    KwargsType,
    paginationSelectors,
    PaginationState,
} from '@thorgate/spa-pagination-reducer';
import { ReactElement, useCallback } from 'react';
import { connect } from 'react-redux';

export interface PaginationOptions {
    hasNext: boolean;
    hasPrev: boolean;
    loadNext: () => void;
    reload: () => void;
    loadPrev: () => void;
}

export interface PaginationProps {
    name: string;
    trigger: FetchAction<string, any>;
    render: (params: PaginationOptions) => ReactElement;
}

interface StateProps {
    hasNext: boolean;
    nextKwargs: KwargsType;
    currentKwargs: KwargsType;
    hasPrev: boolean;
    prevKwargs: KwargsType;
}

const PaginationBase = (props: PaginationProps & StateProps) => {
    const loadNext = useCallback(() => {
        props.trigger({ query: props.nextKwargs });
    }, [props.nextKwargs, props.trigger]);
    const reload = useCallback(() => {
        props.trigger({ query: props.currentKwargs });
    }, [props.currentKwargs, props.trigger]);
    const loadPrev = useCallback(() => {
        props.trigger({ query: props.prevKwargs });
    }, [props.prevKwargs, props.trigger]);

    if (hasRenderPropFn(props)) {
        return props.render({
            hasNext: props.hasNext,
            hasPrev: props.hasPrev,
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

const mapStateToProps = <T extends PaginationState>(
    state: T,
    ownProps: PaginationProps
) => ({
    hasNext: paginationSelectors.selectHasNext(state, ownProps.name),
    nextKwargs: paginationSelectors.selectNextKwargs(state, ownProps.name),
    currentKwargs: paginationSelectors.selectCurrentKwargs(
        state,
        ownProps.name
    ),
    prevKwargs: paginationSelectors.selectPrevKwargs(state, ownProps.name),
    hasPrev: paginationSelectors.selectHasPrev(state, ownProps.name),
});

export const Pagination = connect(mapStateToProps)(PaginationBase);
