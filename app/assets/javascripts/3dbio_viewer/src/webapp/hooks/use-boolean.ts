import React from "react";

type Callback = () => void;

type UseBooleanReturn = [boolean, UseBooleanActions];

interface UseBooleanActions {
    set: (newValue: boolean) => void;
    toggle: Callback;
    enable: Callback;
    open: Callback;
    disable: Callback;
    close: Callback;
}

export function useBooleanState(initialValue: boolean): UseBooleanReturn {
    const [value, setValue] = React.useState(initialValue);

    const actions = React.useMemo(() => {
        return {
            set: (newValue: boolean) => setValue(newValue),
            enable: () => setValue(true),
            open: () => setValue(true),
            disable: () => setValue(false),
            close: () => setValue(false),
            toggle: () => setValue(value_ => !value_),
        };
    }, [setValue]);

    return [value, actions];
}
