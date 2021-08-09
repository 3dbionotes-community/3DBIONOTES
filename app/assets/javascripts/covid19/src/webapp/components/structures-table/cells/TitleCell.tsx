import React from "react";
import { CellProps, styles } from "../Columns";

export const TitleCell: React.FC<CellProps> = React.memo(props => {
    return <div style={styles.title}>{props.row.title}</div>;
});
