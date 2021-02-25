import React from "react";

type Event = React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>;

/* A React.useCallback that extracts the string value from a React target event */
export function useCallbackFromEventValue(fn: (value: string) => void) {
    return React.useCallback((ev: Event) => fn(ev.target.value.trim()), [fn]);
}
