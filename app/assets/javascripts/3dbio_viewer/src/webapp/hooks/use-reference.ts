import React from "react";

/* Functionality of React.useRef with the signature of React.useState */

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
