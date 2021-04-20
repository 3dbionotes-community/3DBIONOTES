import React from "react";
import _ from "lodash";
import { useGoto } from "../../hooks/use-goto";
import { buildDbItem, getItemParam, SelectionState } from "../../view-models/SelectionState";

const innerSeparator = "+";
const mainSeparator = "|";

export function useViewerSelector(
    selector: string | undefined
): [SelectionState, (state: SelectionState) => void] {
    const goTo = useGoto();
    const [main = "", overlay = ""] = (selector || "").split(mainSeparator, 2);
    const [mainPdbRichId, mainEmdbRichId] = main.split(innerSeparator, 2);
    const overlayIds = overlay.split(innerSeparator);
    const pdbItem = buildDbItem(mainPdbRichId);

    const selection: SelectionState = {
        main: pdbItem ? { pdb: pdbItem, emdb: buildDbItem(mainEmdbRichId) } : undefined,
        overlay: _.compact(overlayIds.map(buildDbItem)),
    };

    const setSelection = React.useCallback(
        (newSelection: SelectionState) => {
            const { main, overlay } = newSelection;
            const mainParts = main ? [getItemParam(main.pdb), getItemParam(main.emdb)] : [];
            const parts = [
                _.compact(mainParts).join(innerSeparator),
                overlay.map(getItemParam).join(innerSeparator),
            ];
            const newPath = _.compact(parts).join(mainSeparator);

            goTo(newPath);
        },
        [goTo]
    );

    return [selection, setSelection];
}
