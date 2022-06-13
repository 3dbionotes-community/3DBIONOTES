import React from "react";

type EventWithStringValue = React.ChangeEvent<
    HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
>;

/* A React.useCallback that extracts the string value from a React target event */
export function useCallbackFromEventValue(fn: (value: string) => void) {
    return React.useCallback((ev: EventWithStringValue) => fn(ev.target.value.trim()), [fn]);
}
