/**
 * Global loading manager
 * ----------------------
 * A tiny, framework-agnostic store that tracks how many API requests are
 * currently in flight. The shared axios instance increments it on every
 * request and decrements it when the request settles. UI components subscribe
 * to it through `useSyncExternalStore` (see `@/components/Loader`).
 *
 * Design notes:
 * - A short delay (`SHOW_DELAY_MS`) prevents a flash of the loader for very
 *   fast requests.
 * - Once shown, the loader stays visible for at least `MIN_VISIBLE_MS` so it
 *   does not flicker when requests settle almost immediately.
 * - Any request can opt out entirely by passing `{ silent: true }` as the
 *   axios config. This is used for background work such as on-demand
 *   translation batches, which must never blank the UI.
 */

const listeners = new Set();

let count = 0;
let visible = false;
let snapshot = { count: 0, visible: false };

let showTimer = null;
let hideTimer = null;
let shownAt = 0;

const SHOW_DELAY_MS = 250;
const MIN_VISIBLE_MS = 400;

function publish() {
    if (snapshot.count === count && snapshot.visible === visible) return;
    snapshot = { count, visible };
    for (const listener of listeners) {
        try {
            listener(snapshot);
        } catch (err) {
            // A broken subscriber must never break request handling.
            console.error("[globalLoading] listener error:", err);
        }
    }
}

/** Subscribe to loading-state changes. Returns an unsubscribe function. */
export function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/**
 * Stable snapshot for `useSyncExternalStore`. The object identity only changes
 * when a value actually changes, which is required to avoid render loops.
 */
export function getSnapshot() {
    return snapshot;
}

/** True while at least one tracked request is in flight. */
export function isGlobalLoading() {
    return count > 0;
}

/** Register the start of a tracked request. */
export function startLoading() {
    count += 1;

    if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
    }

    if (!visible && !showTimer) {
        showTimer = setTimeout(() => {
            showTimer = null;
            if (count > 0) {
                visible = true;
                shownAt = Date.now();
                publish();
            }
        }, SHOW_DELAY_MS);
    }

    publish();
}

/** Register the settle (success or failure) of a tracked request. */
export function stopLoading() {
    count = Math.max(0, count - 1);

    if (count > 0) {
        publish();
        return;
    }

    if (showTimer) {
        clearTimeout(showTimer);
        showTimer = null;
    }

    const elapsed = Date.now() - shownAt;
    const wait = visible ? Math.max(0, MIN_VISIBLE_MS - elapsed) : 0;

    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
        hideTimer = null;
        if (count === 0) {
            visible = false;
            publish();
        }
    }, wait);

    publish();
}

const globalLoading = {
    subscribe,
    getSnapshot,
    startLoading,
    stopLoading,
    isGlobalLoading,
};

export default globalLoading;
