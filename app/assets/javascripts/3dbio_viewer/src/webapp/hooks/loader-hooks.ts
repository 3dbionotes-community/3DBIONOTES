import React from "react";
import { FutureData } from "../../domain/entities/FutureData";
import { PdbInfo } from "../../domain/entities/PdbInfo";
import { Maybe } from "../../utils/ts-utils";
import { useAppContext } from "../components/AppContext";
import { getMainPdbId, Selection } from "../view-models/Selection";
import { useCallbackEffect } from "./use-callback-effect";

export function useValueFromFuture<Value>(
    getFutureValue: () => FutureData<Value> | undefined
): Value | undefined {
    const [value, setValue] = React.useState<Value>();

    const getValue = React.useCallback(() => {
        return getFutureValue()?.run(setValue, console.error);
    }, [getFutureValue, setValue]);

    const getValueCancellable = useCallbackEffect(getValue);

    React.useEffect(getValueCancellable, [getValueCancellable]);

    return value;
}

export function usePdbInfo(selection: Selection): Maybe<PdbInfo> {
    const { compositionRoot } = useAppContext();
    const mainPdbId = getMainPdbId(selection);

    const getPdbInfo = React.useCallback(() => {
        return mainPdbId ? compositionRoot.getPdbInfo.execute(mainPdbId) : undefined;
    }, [mainPdbId, compositionRoot]);

    return useValueFromFuture(getPdbInfo);
}
