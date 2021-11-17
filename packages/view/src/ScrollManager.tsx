import { Component, useEffect } from 'react';
import { useLocation, withRouter } from 'react-router';
import { NamedRouteConfigComponentProps } from 'tg-named-routes';

import { SafeStorage } from './Storage';
import { getSessionStorage, windowPageOffset, windowScroll } from './Window';

interface Snapshot {
    locationUpdate?: boolean;
}

type Props = NamedRouteConfigComponentProps;

/**
 * This component will scroll the users to top every time an user navigates. The exception here being that
 *  when the user navigates back/forward via browser history then their scroll position is restored. The component
 *  should be rendered it in the root of your tree (usually in your AppShell as the child of your root router).
 *
 * If you want to restore scroll position when a `push` action occurs then set the `$restoreScroll` field in the
 *  navigation state to true.
 *
 * Note: If you want to skip preserving the scroll position during forward/back actions then use
 *  `ScrollToTopOnNavigate` instead.
 */
class SmartScrollToTopBase extends Component<Props, never, Snapshot> {
    protected sessionStorage: SafeStorage;

    constructor(props: Props) {
        super(props);

        this.sessionStorage = getSessionStorage();
    }

    public componentDidMount() {
        this.restoreScrollPosition();
    }

    public getSnapshotBeforeUpdate(prevProps: Props): Snapshot | null {
        const { location } = this.props;

        if (prevProps.location.key !== location.key) {
            return {
                locationUpdate: true,
            };
        }

        return null;
    }

    public componentDidUpdate(_: never, _1: never, snapshot: Snapshot) {
        if (snapshot !== null) {
            const { locationUpdate } = snapshot;

            if (locationUpdate) {
                this.rememberScrollPosition();
                this.restoreScrollPosition();
            }
        }
    }

    public componentWillUnmount() {
        this.rememberScrollPosition();
    }

    protected restoreScrollPosition() {
        const {
            history: { action },
            location: { key = 'root', state },
        } = this.props;

        const shouldRestore =
            action === 'POP' || (action === 'PUSH' && state['$restoreScroll']);

        // POP means user is going forward or backward in history (e.g. via back and forward buttons)
        //   Lets restore previous scroll position.
        if (shouldRestore) {
            const pos =
                this.sessionStorage.getItem(`View.scrollPositions.${key}`) ||
                '0;0';

            const [posX, posY] = pos.split(';');

            let x = parseInt(posX, 10);
            let y = parseInt(posY, 10);

            if (Number.isNaN(x)) {
                x = 0;
            }

            if (Number.isNaN(y)) {
                y = 0;
            }

            windowScroll(x, y);
        } else {
            setTimeout(() => windowScroll(0, 0, null), 5);
        }
    }

    protected rememberScrollPosition() {
        // Remember scroll position so we can restore if we return to this view via browser history (back/forward btn)
        const {
            location: { key = 'root' },
        } = this.props;
        const [x, y] = windowPageOffset();

        this.sessionStorage.setItem(`View.scrollPositions.${key}`, `${x};${y}`);
    }

    render() {
        return null;
    }
}

export const SmartScrollToTop = withRouter(SmartScrollToTopBase);

/**
 * This component will scroll the users to top every time a route change occurs. This should
 *  be rendered it in the root of your tree (usually in your AppShell as the child of your root router).
 *
 * Note: If you want to preserve scroll position when user navigates back and
 *  forward via browser history then use `SmartScrollToTop` instead.
 */
export default function ScrollToTopOnNavigate() {
    const { pathname } = useLocation();

    useEffect(() => {
        windowScroll(0, 0);
    }, [pathname]);

    return null;
}

/**
 * This component can be used to scroll to top when a certain page mounts. This should be used separately from
 *  the other scroll managers we expose and works best if you don't set the history.scrollRestoration to manual.
 *
 * Render it in specific places where you want scroll control:
 *
 * // <Route path="..." children={<LongContent />} />
 * function LongContent() {
 *   return (
 *     <div>
 *       <ScrollToTopOnMount />
 *
 *       <h1>Here is my long content page</h1>
 *       <p>...</p>
 *     </div>
 *   );
 * }
 *
 * If you want to scroll to another place then just create your own component/hook based on this one.
 */
export function ScrollToTopOnMount() {
    useEffect(() => {
        windowScroll(0, 0);
    }, []);

    return null;
}
