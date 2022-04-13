import React from "react";
import { Badge } from "./Badge";
import { ExternalIcon, External } from "../External";
import { Link } from "../Link";
import { W3Color } from "../../../../domain/entities/Covid19Info";

export interface BadgeLinkProps {
    text?: string;
    url?: string;
    icon?: ExternalIcon;
    color?: W3Color;
    backgroundColor?: W3Color;
    style?: Record<string, string | number | boolean>;
}

export const BadgeLink: React.FC<BadgeLinkProps> = React.memo(props => {
    const { text, url, icon, color, backgroundColor, style } = props;

    return (
        <Link url={url} style={style}>
            <Badge color={color} backgroundColor={backgroundColor}>
                <External text={text} icon={icon} />
            </Badge>
        </Link>
    );
});
