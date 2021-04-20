import React from "react";
import { Link as LinkE } from "../../domain/entities/Link";

interface LinkProps {
    name: string;
    url: string | undefined;
}

export const Link: React.FC<LinkProps> = React.memo(props => {
    const { name, url } = props;

    if (url) {
        return (
            <a href={url} target="_blank" rel="noreferrer">
                {name}
            </a>
        );
    } else {
        return <span>{name}</span>;
    }
});

export interface LinkFromObjProps {
    link: LinkE | undefined;
    emptyValue?: string;
}

export const LinkFromObj: React.FC<LinkFromObjProps> = React.memo(props => {
    const { link, emptyValue = "-" } = props;
    if (!link) return <span>{emptyValue}</span>;

    const { name, url } = link;

    return <Link name={name} url={url} />;
});
