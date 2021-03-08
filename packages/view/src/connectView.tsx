import { OptionalMap } from '@thorgate/spa-is';
import React, { ComponentType, FC } from 'react';

import { View, ViewProps } from './View';

export type ViewDecoratorOptions = Pick<
    ViewProps,
    | 'className'
    | 'NotFoundComponent'
    | 'onUserUpdate'
    | 'Fallback'
    | 'onComponentError'
>;

export const defaultConnectOptions: ViewDecoratorOptions = {
    onComponentError: () => null,
};

export const connectView = (options: OptionalMap<ViewDecoratorOptions> = {}) =>
    function decorator<P>(Component: ComponentType<P>) {
        const WrappedComponent: FC<P> = (props) => (
            <View {...defaultConnectOptions} {...options}>
                <Component {...props} />
            </View>
        );
        WrappedComponent.displayName = `connectView(${
            Component.displayName || Component.name
        })`;
        return WrappedComponent;
    };
