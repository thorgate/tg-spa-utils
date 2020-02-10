import { useEffect } from 'react';

import { useSavedCallback } from './useSavedCallback';

// Declare window value is undefined in some cases
// TSLint detects that window is always defined otherwise
// eslint-disable-next-line no-var
declare var window: Window | undefined;

/**
 * Start timeout with callback. When window is not defined, no timeout is started.
 * @param callback
 * @param delay
 */
export const useTimeout = (callback: () => void, delay?: number) => {
    const savedCallback = useSavedCallback(callback);

    useEffect(() => {
        function tick() {
            if (savedCallback.current) {
                savedCallback.current();
            }
        }

        if (typeof window !== 'undefined') {
            const id = window.setTimeout(tick, delay);
            return () => clearInterval(id);
        }

        return undefined;
    }, [delay]);
};
