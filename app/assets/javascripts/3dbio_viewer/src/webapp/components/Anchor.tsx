import React from "react";

interface AnchorProps {
    href: string;
}

export const Anchor: React.FC<AnchorProps> = React.memo(({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer noopener">
        {children}
    </a>
));
