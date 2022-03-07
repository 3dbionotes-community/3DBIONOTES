import React from "react";
import { DbItem } from "../../../domain/entities/Covid19Info";
import { styles } from "./Columns";
import { BadgeLink } from "./BadgeLink";
import { Tooltip } from "./Link";
import { HtmlTooltip } from "./HtmlTooltip";
import { urlPrefix } from "./cells/TitleCell";

interface ThumbnailProps {
    type: "pdb" | "emdb";
    value: DbItem;
    tooltip: Tooltip;
}

export const Thumbnail: React.FC<ThumbnailProps> = React.memo(props => {
    const { value, tooltip, type } = props;
    const { imageUrl: imageSrc, id: name } = value;
    const href = urlPrefix + (type === "emdb" ? value.id.toUpperCase() : value.id.toLowerCase());

    return (
        <div style={styles.thumbnailWrapper}>
            <HtmlTooltip title={tooltip}>
                <a href={href} target="_blank" rel="noreferrer">
                    <img alt={name} src={imageSrc} loading="lazy" style={styles.image} />
                </a>
            </HtmlTooltip>

            <p>
                <a href={href} target="_blank" rel="noreferrer" style={styles.link}>
                    {name}
                </a>
            </p>

            {value.externalLinks.map(externalLink => (
                <BadgeLink
                    key={externalLink.url}
                    url={externalLink.url}
                    text={externalLink.text}
                    icon="external"
                />
            ))}
        </div>
    );
});
