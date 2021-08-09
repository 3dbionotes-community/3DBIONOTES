import React from "react";
import i18n from "../../../../utils/i18n";
import { CellProps, styles } from "../Columns";
import { BadgeLink } from "../BadgeLink";
import BSMArcImage from "../BSM-arc-generic-photo.png";
import { ComputationalModel } from "../../../../domain/entities/Covid19Info";

const defaultImagesUrl: Partial<Record<ComputationalModel["source"], string>> = {
    "BSM-Arc": BSMArcImage,
};

export const ComputationalModelCell: React.FC<CellProps> = React.memo(props => {
    const { computationalModel } = props.row;
    if (!computationalModel) return null;

    const { source, project, externalLink, queryLink } = computationalModel;

    return (
        <div style={styles.thumbnailWrapper}>
            <img
                alt={project}
                src={computationalModel.imageLink || defaultImagesUrl[source]}
                loading="lazy"
                style={styles.image}
            />

            <p>{project}</p>

            <BadgeLink key={externalLink} url={externalLink} text={source} icon="external" />

            <BadgeLink
                key={queryLink}
                url={queryLink}
                text={i18n.t("Go to Viewer")}
                icon="viewer"
            />
        </div>
    );
});
