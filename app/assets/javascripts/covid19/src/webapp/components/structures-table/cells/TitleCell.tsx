import React from "react";
import { CellProps } from "../Columns";
import { BadgeLink } from "../BadgeLink";

export const TitleCell: React.FC<CellProps> = React.memo(props => {
    const structure = props.row;
    const queryLinkToUse = structure.emdb?.queryLink || structure.pdb?.queryLink;

    return (
        <>
            <div style={styles.title}>{props.row.title}</div>

            <BadgeLink
                style={styles.badgeLink}
                key={queryLinkToUse}
                url={queryLinkToUse}
                icon="viewer"
            />
        </>
    );
});

const styles = {
    title: {
        lineHeight: "20px",
        display: "inline",
    },
    badgeLink: {
        display: "inline-block",
        marginLeft: 5,
    },
};
