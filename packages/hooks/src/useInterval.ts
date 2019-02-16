import { useEffect } from 'react';

import { useSavedCallback } from './useSavedCallback';


// Declare window value is undefined in some cases
// TSLint detects that window is always defined otherwise
declare var window: Window | undefined;


/**
 * Start interval with callback. If delay is null, then interval is paused.
 *   When window is not defined, no interval is started.
 *
 * @param callback - Callback called when interval is triggered
 * @param delay - Delay in number or if null, interval is paused
 * @param cleanup - Optional cleanup helper called when interval is cleared
 */
export const useInterval = (callback: () => void, delay: number | null, cleanup: () => void = () => null) => {
    const savedCallback = useSavedCallback(callback);
    const savedCleanup = useSavedCallback(cleanup);

    useEffect(() => {
        function tick() {
            if (savedCallback.current) {
                savedCallback.current();
            }
        }

        if (delay !== null && typeof window !== 'undefined') {
            const id = setInterval(tick, delay);
            return () => {
                clearInterval(id);

                if (savedCleanup.current) {
                    savedCleanup.current();
                }
            };
        }

        return () => null;
    }, [delay]);
};
