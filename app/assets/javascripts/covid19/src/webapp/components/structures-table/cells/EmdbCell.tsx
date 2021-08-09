import React from "react";
import { CellProps } from "../Columns";
import { Thumbnail } from "../Thumbnail";

export const EmdbCell: React.FC<CellProps> = React.memo(props => {
    const { emdb } = props.row;
    return emdb ? <Thumbnail type="pdb" value={emdb} /> : null;
});
