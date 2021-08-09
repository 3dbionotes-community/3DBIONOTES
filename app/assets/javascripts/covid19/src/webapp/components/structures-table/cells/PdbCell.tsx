import React from "react";
import { CellProps } from "../Columns";
import { Thumbnail } from "../Thumbnail";

export const PdbCell: React.FC<CellProps> = React.memo(props => {
    const { pdb } = props.row;
    return pdb ? <Thumbnail type="pdb" value={pdb} /> : null;
});
