import React from "react";
import { CellProps } from "../Columns";

export const DetailsCell: React.FC<CellProps> = React.memo(props => {
    return <span>{props.row.details}</span>;
});
