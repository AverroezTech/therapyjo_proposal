"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Guards unsaved form text against being thrown away.
 *
 * `dirty` is computed by the caller — this hook does not know what a form is.
 * It does two things: warns on browser close/reload while dirty, and hands
 * back a `confirmDiscard()` the caller must call before any action that would
 * overwrite the form (a refetch) or leave the page.
 *
 * There is no autosave, by decision: a warning was judged enough. (TJ-022)
 */
export function useUnsavedChanges(dirty: boolean) {
    // Kept in a ref so the beforeunload listener is registered once and still
    // reads the current value; re-binding on every keystroke would be wasteful.
    const dirtyRef = useRef(dirty);
    // Written in an effect, not during render: assigning to a ref while
    // rendering is what react-hooks/refs flags, and the rule is right —
    // a ref write does not re-render, so anything derived from it can go
    // stale. The listener below reads it, and only ever after paint.
    useEffect(() => { dirtyRef.current = dirty; }, [dirty]);

    useEffect(() => {
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!dirtyRef.current) return;
            // The browser shows its own generic wording; a custom message has
            // been ignored by every major browser for years. Both lines are
            // required for cross-browser coverage.
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", onBeforeUnload);
        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, []);

    const confirmDiscard = useCallback(
        (message: string) => !dirtyRef.current || window.confirm(message),
        []
    );

    return { confirmDiscard };
}
