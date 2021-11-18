import React from "react";
import { CellProps, styles } from "../Columns";
import { BadgeLink } from "../BadgeLink";

export const TitleCell: React.FC<CellProps> = React.memo(props => {
    let queryLinkToUse;

    if ((props.row?.pdb && props.row?.emdb) || props.row?.pdb) {
        queryLinkToUse = props.row?.pdb.queryLink;
    } else if (props.row?.emdb) {
        queryLinkToUse = props.row.emdb?.queryLink;
    }

    return (
        <>
            <div style={{ ...styles.title, display: "inline" }}>{props.row.title}</div>
            <BadgeLink
                style={badgeStyles.badgeLink}
                key={queryLinkToUse}
                url={queryLinkToUse}
                icon="viewer"
            />
        </>
    );
});

const badgeStyles = {
    badgeLink: {
        display: "inline-block",
        marginLeft: 5,
    },
};
