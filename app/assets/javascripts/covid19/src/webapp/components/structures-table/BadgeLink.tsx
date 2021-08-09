import React from "react";
import { Badge } from "./Badge";
import { ExternalIcon, External } from "./External";
import { Link } from "./Link";
import { styles } from "./Columns";

export const BadgeLink: React.FC<BadgeLinkProps> = React.memo(props => {
    const { text, url, icon } = props;

    return (
        <Link url={url}>
            <Badge style={styles.badgeExternalLink}>
                <External text={text} icon={icon} />
            </Badge>
        </Link>
    );
});
interface BadgeLinkProps {
    text: string;
    url: string;
    icon: ExternalIcon;
}
