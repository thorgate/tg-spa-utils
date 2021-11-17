// Extend window
// eslint-disable-next-line no-var
declare var window: (Window & { $spaManualScroll?: boolean }) | undefined;

export const initSpaScroll = () => {
    // Skip if running on server
    if (typeof window === 'undefined') {
        return;
    }

    // Let View know that scroll is handled separately
    window.$spaManualScroll = true;

    // Tell the browser that the scroll restoration is controlled by us
    if (window?.history) {
        window.history.scrollRestoration = 'manual';
    }
};
