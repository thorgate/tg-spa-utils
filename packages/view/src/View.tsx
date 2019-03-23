import {
    ComponentErrorCallback, ErrorBoundary, ErrorComponent, ErrorState, ErrorType, getError
} from '@thorgate/spa-errors';
import { getUser, isAuthenticated, User, UserState } from '@thorgate/spa-permissions';
import React, { Component, ComponentClass, ComponentType, ReactNode } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { NamedRouteConfigComponentProps } from 'tg-named-routes';

import { SafeStorage } from './Storage';
import { getSessionStorage, windowPageOffset, windowScroll } from './Window';


declare var window: Window | undefined;

export interface ViewProvidedProps {
    error: ErrorType;
    user: User;
    isAuthenticated: boolean;
}

export type UserUpdateCallback = (user: User) => void;

export interface ViewProps {
    className?: string | null;
    NotFoundComponent?: ComponentType;

    Fallback?: ErrorComponent;
    onComponentError?: ComponentErrorCallback;

    onUserUpdate?: UserUpdateCallback;

    children?: ReactNode;
}

interface ViewInternalProps extends ViewProps, ViewProvidedProps, NamedRouteConfigComponentProps {
}

interface ViewBaseSnapshot {
    locationUpdate?: boolean;
    userUpdate?: boolean;
}

type ViewSnapshot = ViewBaseSnapshot | null;


function shouldHandleScrollRestoration(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.history && window.history.scrollRestoration && window.history.scrollRestoration !== 'auto';
}


class ViewBase extends Component<ViewInternalProps, never, ViewSnapshot> {
    public static defaultProps = {
        children: null,
        className: null,
        activeLanguage: '',
        error: null,
    };

    protected sessionStorage: SafeStorage = getSessionStorage();
    protected static shouldHandleScrollRestoration = shouldHandleScrollRestoration();

    public componentDidMount() {
        this.restoreScrollPosition();
    }

    public getSnapshotBeforeUpdate(prevProps: ViewInternalProps): ViewSnapshot {
        let snapshot: ViewSnapshot = null;

        if (prevProps.location.key !== this.props.location.key) {
            snapshot = {
                locationUpdate: true,
            };
        }

        if (prevProps.user !== this.props.user) {
            if (!snapshot) {
                snapshot = {};
            }

            snapshot.userUpdate = true;
        }

        return snapshot;
    }

    public componentDidUpdate(_: never, _1: never, snapshot: ViewSnapshot) {
        if (snapshot !== null) {
            const { locationUpdate, userUpdate } = snapshot;

            if (locationUpdate) {
                this.rememberScrollPosition();
                this.restoreScrollPosition();
            }

            if (userUpdate && this.props.onUserUpdate) {
                this.props.onUserUpdate(this.props.user);
            }
        }
    }

    public componentWillUnmount() {
        this.rememberScrollPosition();
    }

    public render() {
        const { error, NotFoundComponent } = this.props;

        // Render default 404 or component provided with decorator
        if (NotFoundComponent && error && error.statusCode === 404) {
            return <NotFoundComponent />;
        }

        // Render correct view wrapped in ErrorBoundary, view node is cloned and extra props are added
        return this.renderChildren();
    }

    protected restoreScrollPosition = () => {
        if (!ViewBase.shouldHandleScrollRestoration) {
            return;
        }

        const { history: { action }, location: { key = 'root', hash } } = this.props;
        let scrollToTop = hash.length === 0;

        // POP means user is going forward or backward in history, restore previous scroll position
        if (action === 'POP') {
            const pos = this.sessionStorage.getItem(`View.scrollPositions.${key}`);
            if (pos) {
                const [posX, posY] = pos.split(';');

                let x = parseInt(posX, 10);
                let y = parseInt(posY, 10);

                if (isNaN(x)) {
                    x = 0;
                }

                if (isNaN(y)) {
                    y = 0;
                }

                windowScroll(x, y);
                scrollToTop = false;
            }
        }

        if (scrollToTop) {
            // Scroll to top of viewport
            windowScroll(0, 0);
        }
    };

    protected rememberScrollPosition = () => {
        if (!ViewBase.shouldHandleScrollRestoration) {
            return;
        }

        // Remember scroll position so we can restore if we return to this view via browser history
        const { location: { key = 'root' } } = this.props;
        const [x, y] = windowPageOffset();

        this.sessionStorage.setItem(`View.scrollPositions.${key}`, `${x};${y}`);
    };

    protected renderChildren = () => {
        const children = React.Children.map(this.props.children, (child) => {
            return React.cloneElement(child as any, {
                error: this.props.error,
                isAuthenticated: this.props.isAuthenticated,
                user: this.props.user,
            });
        });

        let content: ReactNode = children;
        if (this.props.className) {
            content = (
                <div className={this.props.className}>
                    {children}
                </div>
            );
        }

        return (
            <ErrorBoundary
                onComponentError={this.props.onComponentError}
                ErrorHandler={this.props.Fallback}
                error={this.props.error}
            >
                {content}
            </ErrorBoundary>
        );
    };
}

interface ReduxState extends ErrorState, UserState {
}

const mapStateToProps = (state: ReduxState) => ({
    error: getError(state),
    isAuthenticated: isAuthenticated(state),
    user: getUser(state),
});

export const View: ComponentClass<ViewProps> = withRouter(connect(mapStateToProps)(ViewBase));
