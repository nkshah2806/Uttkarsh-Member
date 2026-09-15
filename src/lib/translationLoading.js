/**
 * Centralized translation loading manager (Member / Franchise Panel)
 * ------------------------------------------------------------------
 * A tiny, framework-agnostic store that tracks how many Google-Translate
 * batches are currently in flight (across the whole member panel) together with
 * the most recent translation error.
 *
 * Every translation request funnels through `@/lib/translate`'s batched queue,
 * so `flushQueue` is the single place that calls `startTranslation()` before the
 * network request and `stopTranslation()` once it settles (success OR failure).
 * UI components subscribe through `useSyncExternalStore` (see
 * `@/components/Loader` → `TranslationLoader`).
 *
 * Design notes:
 * - Same timing policy as `globalLoading`: a short delay prevents a flash for
 *   fast lookups, and once shown the indicator stays for a minimum duration so
 *   it does not flicker.
 * - A never-stuck guarantee is provided by `withTranslation`, which wraps the
 *   request body in `try/finally`.
 */

const listeners = new Set();

let count = 0;
let visible = false;
let error = null;
let snapshot = { count: 0, visible: false, error: null };

let showTimer = null;
let hideTimer = null;
let shownAt = 0;

const SHOW_DELAY_MS = 200;
const MIN_VISIBLE_MS = 400;

function publish() {
    if (
        snapshot.count === count &&
        snapshot.visible === visible &&
        snapshot.error === error
    ) {
        return;
    }
    snapshot = { count, visible, error };
    for (const listener of listeners) {
        try {
            listener(snapshot);
        } catch (err) {
            // A broken subscriber must never break request handling.
            console.error("[translationLoading] listener error:", err);
        }
    }
}

/** Subscribe to translation-loading changes. Returns an unsubscribe function. */
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

/** True while at least one translation batch is in flight. */
export function isTranslating() {
    return count > 0;
}

/** The most recent translation error message, or `null` when healthy. */
export function getTranslationError() {
    return error;
}

/** Clear a previously recorded translation error. */
export function clearTranslationError() {
    if (error === null) return;
    error = null;
    publish();
}

/** Record a translation failure so the UI can surface a non-blocking notice. */
export function markTranslationError(message) {
    error = message || "Translation failed";
    publish();
}

/** Register the start of a translation batch. */
export function startTranslation() {
    count += 1;
    // A new batch supersedes any previous error notice.
    error = null;

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

/** Register the settle (success or failure) of a translation batch. */
export function stopTranslation() {
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

/**
 * Wrap an async translation task so the loading counter can never leak.
 * The loader starts immediately, and `finally` guarantees it stops on success
 * OR failure, so a rejected request can never leave the indicator stuck.
 */
export async function withTranslation(task) {
    startTranslation();
    try {
        return await task();
    } finally {
        stopTranslation();
    }
}

const translationLoading = {
    subscribe,
    getSnapshot,
    startTranslation,
    stopTranslation,
    withTranslation,
    isTranslating,
    getTranslationError,
    markTranslationError,
    clearTranslationError,
};

export default translationLoading;
