import React from "react";
import { Badge } from "./Badge";
import { ExternalIcon, External } from "./External";
import { Link } from "./Link";
import { W3Color } from "../../../domain/entities/Covid19Info";

export interface BadgeLinkProps {
    text?: string;
    url?: string;
    icon?: ExternalIcon;
    color?: W3Color;
    style?: Record<string, string | number | boolean>;
}

export const BadgeLink: React.FC<BadgeLinkProps> = React.memo(props => {
    const { text, url, icon, color, style } = props;

    const badgeStyle = React.useMemo(() => {
        const htmlColor = color ? colors[color] : undefined;

        return {
            ...styles.badge,
            ...(htmlColor ? { backgroundColor: htmlColor, borderColor: htmlColor } : {}),
        };
    }, [color]);

    return (
        <Link url={url} style={style}>
            <Badge style={badgeStyle}>
                <External text={text} icon={icon} />
            </Badge>
        </Link>
    );
});

// https://www.w3schools.com/w3css/4/w3.css
const colors: Record<W3Color, string> = {
    "w3-cyan": "#00bcd4",
    "w3-turq": "#009688",
};

export const styles = {
    badge: {
        backgroundColor: "#607d8b",
        borderColor: "#607d8b",
        marginRight: 5,
    },
};
