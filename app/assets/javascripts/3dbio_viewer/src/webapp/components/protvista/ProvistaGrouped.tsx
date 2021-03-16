import React from "react";
import _ from "lodash";
import { SelectionState } from "../../view-models/SelectionState";
import { usePdbLoader } from "../../hooks/use-pdb";
import { ProtvistaPdb } from "./ProtvistaPdb";

export interface ProtvistaGroupedProps {
    selection: SelectionState;
}

export const ProtvistaGrouped: React.FC<ProtvistaGroupedProps> = React.memo(() => {
    const loader = usePdbLoader();

    return loader.type === "loaded" ? <ProtvistaPdb pdb={loader.data} /> : <div>Loading...</div>;
});
