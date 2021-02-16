import React from "react";
import _ from "lodash";

export function useDebounce<Fun extends (...args: any) => any>(fn: Fun, debounceMs: number) {
    return React.useMemo(() => _.debounce(fn, debounceMs), [fn, debounceMs]);
}
