import React from "react";
import { Maybe } from "../../data/utils/ts-utils";
import { sendAnalytics } from "../../utils/analytics";
import { useBooleanState } from "./useBoolean";

type UseInfoDialogReturn<T> = {
    info: Maybe<T>;
    setInfo: React.Dispatch<React.SetStateAction<T | undefined>>;
    useDialogState: [
        isDialogOpen: boolean,
        closeDialog: () => void,
        showDialog: (options: T, gaLabel: string) => void
    ];
};

export function useInfoDialog<T>(): UseInfoDialogReturn<T> {
    const [isDialogOpen, { enable: openDialog, disable: closeDialog }] = useBooleanState(false);
    const [info, setInfo] = React.useState<T>();

    const showDialog = React.useCallback(
        (options: T, gaLabel: string) => {
            sendAnalytics("open_dialog", {
                label: gaLabel,
            });
            openDialog();
            setInfo(options);
        },
        [openDialog]
    );

    return { info, setInfo, useDialogState: [isDialogOpen, closeDialog, showDialog] };
}
