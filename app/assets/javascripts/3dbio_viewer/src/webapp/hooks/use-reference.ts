import React from "react";

/* React.useRef with the same interface than React.useState, so updates do not issue a re-render */

export function useReference<T>(initialValue?: T): [T | undefined, (newValue: T) => void] {
    const ref = React.useRef<T>();
    if (ref.current === undefined) ref.current = initialValue;

    const setNewValue = React.useCallback(
        (newValue: T) => {
            ref.current = newValue;
        },
        [ref]
    );

    return [ref.current, setNewValue];
}
