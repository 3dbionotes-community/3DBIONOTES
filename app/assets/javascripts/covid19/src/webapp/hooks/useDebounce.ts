import React from "react";
import _ from "lodash";

export function useDebouncedSetter<T>(
    value: T,
    setValue: (newValue: T) => void,
    options: { delay: number }
) {
    const { delay } = options;
    const [stateValue, updateStateValue] = React.useState(value);
    React.useEffect(() => updateStateValue(value), [value]);

    const onChangeDebounced = React.useMemo(() => {
        return _.debounce(setValue, delay);
    }, [setValue, delay]);

    const setValueDebounced = React.useCallback(
        (value: T) => {
            updateStateValue(value);
            onChangeDebounced(value);
        },
        [onChangeDebounced, updateStateValue]
    );

    return [stateValue, setValueDebounced] as const;
}
