import React from "react";
import { Maybe } from "../../data/utils/ts-utils";
import { sendAnalytics } from "../../utils/analytics";
import { useBooleanState } from "./useBoolean";

type UseInfoDialogReturn<T> = [
    boolean,
    () => void,
    Maybe<T>,
    (options: T, gaLabel: string) => void
];

export function useInfoDialog<T>(): UseInfoDialogReturn<T> {
    const [isDialogOpen, { enable: openDialog, disable: closeDialog }] = useBooleanState(false);
    const [info, setInfo] = React.useState<T>();

    const showDialog = React.useCallback(
        (options: T, gaLabel: string) => {
            sendAnalytics({
                type: "event",
                action: "open",
                category: "dialog",
                label: gaLabel,
            });
            openDialog();
            setInfo(options);
        },
        [openDialog]
    );

    return [isDialogOpen, closeDialog, info, showDialog];
}
