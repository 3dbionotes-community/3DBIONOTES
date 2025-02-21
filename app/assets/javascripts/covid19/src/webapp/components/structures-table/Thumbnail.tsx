import React from "react";
import { DbItem } from "../../../domain/entities/Covid19Info";
import { styles } from "./Columns";
import { BadgeLink } from "./badge/BadgeLink";
import { Tooltip } from "./Link";
import { HtmlTooltip } from "./HtmlTooltip";
import { urlPrefix } from "./cells/TitleCell";

interface ThumbnailProps {
    value: DbItem;
    tooltip: Tooltip;
}

export const Thumbnail: React.FC<ThumbnailProps> = React.memo(props => {
    const { value, tooltip } = props;
    const { imageUrl: imageSrc, id: name } = value;
    const href = urlPrefix + value.queryLink;

    return (
        <div style={styles.thumbnailWrapper}>
            <HtmlTooltip title={tooltip}>
                <a href={href} target="_blank" rel="noreferrer">
                    <img
                        alt={name}
                        src={imageSrc}
                        loading="lazy"
                        style={{ ...styles.image, ...thumnailStyles }}
                    />
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

const thumnailStyles = {
    marginBottom: "1em",
};
