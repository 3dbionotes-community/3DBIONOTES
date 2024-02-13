import React from "react";
import { CellProps } from "../Columns";
import { BadgeLink } from "../badge/BadgeLink";

// export const urlPrefix = "/?queryId="; //development-old-viewer

export const urlPrefix = "/ws/viewer/#"; //development

export const TitleCell: React.FC<CellProps> = React.memo(props => {
    const structure = props.row;
    const queryLinkToUse = urlPrefix + structure.queryLink;

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
