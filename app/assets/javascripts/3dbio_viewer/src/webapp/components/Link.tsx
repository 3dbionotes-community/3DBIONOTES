import React from "react";

interface LinkProps {
    name: string;
    url: string;
}

export const Link: React.FC<LinkProps> = React.memo(props => {
    const { name, url } = props;

    return (
        <a href={url} target="_blank" rel="noreferrer">
            {name}
        </a>
    );
});
