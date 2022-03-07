import React from "react";
import { CellProps } from "../Columns";
import { BadgeLink } from "../BadgeLink";

export const urlPrefix = "https://3dbionotes.cnb.csic.es/?queryId=";

export const TitleCell: React.FC<CellProps> = React.memo(props => {
    const structure = props.row;
    const queryLinkToUse =
        urlPrefix + (structure.emdb?.id.toUpperCase() || structure.pdb?.id.toLowerCase());

    return (
        <>
            <div style={styles.title}>
                <a href={queryLinkToUse}>{props.row.title}</a>
            </div>

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
