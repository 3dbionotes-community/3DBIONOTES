import React from "react";
import { CellProps } from "../Columns";
import { BadgeLink } from "../BadgeLink";

export const urlPrefix = "/ws/viewer/#/";

export const TitleCell: React.FC<CellProps> = React.memo(props => {
    const structure = props.row;
    const queryLinkToUse =
        urlPrefix + (structure.emdb?.id.toUpperCase() || structure.pdb?.id.toLowerCase());

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
