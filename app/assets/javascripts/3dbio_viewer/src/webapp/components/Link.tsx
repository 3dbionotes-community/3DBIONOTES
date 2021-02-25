import React from "react";

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
