import { SafeStorage } from './Storage';

// Declare window value is undefined in some cases
// TSLint detects that window is always defined otherwise
// eslint-disable-next-line no-var
declare var window: Window | undefined;

export const getSessionStorage = () =>
    new SafeStorage(
        typeof window !== 'undefined' ? window.sessionStorage : null
    );

export const getLocalStorage = () =>
    new SafeStorage(typeof window !== 'undefined' ? window.localStorage : null);

export const windowScroll = (x: number, y: number) => {
    if (typeof window !== 'undefined') {
        window.scroll(x, y);
    }
};

export const windowPageOffset = () => {
    if (typeof window !== 'undefined') {
        return [window.pageXOffset, window.pageYOffset];
    }

    return [0, 0];
};
