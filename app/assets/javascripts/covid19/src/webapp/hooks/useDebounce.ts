import React from "react";
import _ from "lodash";

export function useEventDebounce(
    value: string,
    setValue: (newValue: string) => void,
    options: { delay: number }
) {
    const [stateValue, updateStateValue] = React.useState(value || "");
    const { delay } = options;

    const onChangeDebounced = React.useMemo(() => {
        return _.debounce(setValue, delay);
    }, [setValue, delay]);

    const setFromEv = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            updateStateValue(value);
            onChangeDebounced(value);
        },
        [onChangeDebounced, updateStateValue]
    );

    return [stateValue, setFromEv] as const;
}
