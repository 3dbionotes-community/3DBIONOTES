import React from "react";
import i18n from "../../../../utils/i18n";
import { CellProps, styles } from "../Columns";
import { BadgeLink } from "../BadgeLink";
import BSMArcImage from "../BSM-arc-generic-photo.png";
import AlphaFoldImage from "../AlphaFold_logo.png";
import { ComputationalModel } from "../../../../domain/entities/Covid19Info";

const defaultImagesUrl: Partial<Record<ComputationalModel["source"], string>> = {
    "BSM-Arc": BSMArcImage,
    AlphaFold: AlphaFoldImage,
};

export const ComputationalModelCell: React.FC<CellProps> = React.memo(props => {
    const { computationalModel } = props.row;
    if (!computationalModel) return null;

    const { source, externalLink, queryLink } = computationalModel;
    const name =
        computationalModel.source === "SWISS-MODEL"
            ? computationalModel.project
            : computationalModel.model;

    return (
        <div style={styles.thumbnailWrapper}>
            <img
                alt={name}
                src={
                    computationalModel.source === "SWISS-MODEL"
                        ? computationalModel.imageLink
                        : defaultImagesUrl[source]
                }
                loading="lazy"
                style={styles.image}
            />

            <p>{name}</p>

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
