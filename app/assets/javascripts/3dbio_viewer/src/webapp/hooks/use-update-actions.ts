import React from "react";
import _ from "lodash";

/* A typical pattern is to have a single immutable update function which can be triggered by many actions.
   This hooks gets the main update function, an object with the action updater and composes them. */
export function useUpdateActions<Actions extends Record<string, (...args: any[]) => Value>, Value>(
    updateFn: (newValue: Value) => void,
    actions: Actions
): { [K in keyof Actions]: (...args: Parameters<Actions[K]>) => void } {
    const updateActions = React.useMemo(() => {
        return _.mapValues(actions, action => pipe(action, updateFn));
    }, [updateFn, actions]);

    return updateActions;
}

function pipe<Args1 extends any[], Result1, Result2>(
    fn1: (...args: Args1) => Result1,
    fn2: (newValue: Result1) => Result2
): (...args: Args1) => Result2 {
    return (...args) => fn2(fn1(...args));
}
