import React from "react";
import i18n from "../../../utils/i18n";
import { DbItem } from "../../../domain/entities/Covid19Info";
import { styles } from "./Columns";
import { BadgeLink } from "./BadgeLink";
import { Tooltip } from "./Link";
import { HtmlTooltip } from "./HtmlTooltip";

interface ThumbnailProps {
    type: "pdb";
    value: DbItem;
    tooltip: Tooltip;
}

export const Thumbnail: React.FC<ThumbnailProps> = React.memo(props => {
    const { value, tooltip } = props;
    const { imageUrl: imageSrc, id: name, queryLink } = value;

    return (
        <div style={styles.thumbnailWrapper}>
            <HtmlTooltip title={tooltip}>
                <img alt={name} src={imageSrc} loading="lazy" style={styles.image} />
            </HtmlTooltip>

            <p>{name}</p>

            {value.externalLinks.map(externalLink => (
                <BadgeLink
                    key={externalLink.url}
                    url={externalLink.url}
                    text={externalLink.text}
                    icon="external"
                />
            ))}

            <BadgeLink
                key={queryLink}
                url={queryLink}
                text={i18n.t("Go to Viewer")}
                icon="viewer"
            />
        </div>
    );
});
