import { MutableRefObject, useEffect, useRef } from 'react';

/**
 * Store callback in ref so we don't relay on state.
 *  Callback will be store for entire component lifetime.
 *
 * @param callback
 */
export const useSavedCallback = <T extends (...args: any[]) => any>(
    callback: T
) => {
    const savedCallback: MutableRefObject<T | null> = useRef(callback);

    // Update ref when callback is changed
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Remove callback when component un-mounts
    useEffect(() => {
        return () => {
            savedCallback.current = null;
        };
    }, []);

    return savedCallback;
};
