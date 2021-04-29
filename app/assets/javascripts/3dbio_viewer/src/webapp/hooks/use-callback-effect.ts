import React from "react";

// Use a wrap value so identical arguments still run a new effect
type ArgsValue<Args extends any[]> = { value: Args };
type Effect = void;
type EffectFn<Args extends any[]> = (...args: Args) => Effect;
type Cancel = { (): void };

/*  Merge the features of React.useCallback and React.useEffect to run a single, non-concurrent,
    cancellable effect. Only one effect will be running concurrently. Thus, if a new effect is
    requested when the previous one has not finished yet, that old effect will be cancelled.
*/

export function useCallbackEffect<Args extends any[]>(
    callback: (...args: Args) => Cancel
): EffectFn<Args> {
    const cancelRef = React.useRef<Cancel>(noop);

    const [args, setArgs] = React.useState<ArgsValue<Args>>();

    const runEffect = React.useCallback<EffectFn<Args>>(
        (...args) => {
            cancelRef.current(); // Cancel current effect
            return setArgs({ value: args });
        },
        [setArgs]
    );

    React.useEffect(() => {
        if (args) {
            const cancelFn = callback(...args.value);
            cancelRef.current = cancelFn;
            return cancelFn;
        }
    }, [callback, args]);

    return runEffect;
}

const noop = () => {};
