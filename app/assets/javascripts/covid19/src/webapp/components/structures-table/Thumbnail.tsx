import React from "react";
import i18n from "../../../utils/i18n";
import { DbItem } from "../../../domain/entities/Covid19Info";
import { styles } from "./Columns";
import { BadgeLink } from "./BadgeLink";

interface ThumbnailProps {
    type: "pdb";
    value: DbItem;
}

export const Thumbnail: React.FC<ThumbnailProps> = React.memo(props => {
    const { value } = props;
    const { imageUrl: imageSrc, id: name } = value;

    return (
        <div style={styles.thumbnailWrapper}>
            <img alt={name} src={imageSrc} loading="lazy" style={styles.image} />

            <p>{name}</p>

            {value.externalLinks.map(externalLink => (
                <BadgeLink
                    key={externalLink.url}
                    url={externalLink.url}
                    text={externalLink.text}
                    icon="external"
                />
            ))}

            {value.queryLink.map(queryLink => (
                <BadgeLink
                    key={queryLink}
                    url={queryLink}
                    text={i18n.t("Go to Viewer")}
                    icon="viewer"
                />
            ))}
        </div>
    );
});
