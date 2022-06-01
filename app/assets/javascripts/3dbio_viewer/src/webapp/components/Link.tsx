import React from "react";
import _ from "lodash";
import { Link as LinkE } from "../../domain/entities/Link";
import { renderJoin } from "../utils/react";

export interface LinkProps {
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
    links: LinkE[];
    emptyValue?: string;
    joinNode?: React.ReactNode;
}

export const Links: React.FC<LinkFromObjProps> = React.memo(props => {
    const { links, emptyValue = "-", joinNode = ", " } = props;
    const linksNodes = links.map(link => <Link key={link.url} name={link.name} url={link.url} />);

    return <span>{_.isEmpty(links) ? emptyValue : renderJoin(linksNodes, joinNode)}</span>;
});
