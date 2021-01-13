import React from "react";
import ReactMarkdown from "react-markdown";
import styled from "styled-components";

const Viewer: React.FC<{ className?: string; source: string; center?: boolean }> = ({
    className,
    source,
}) => <ReactMarkdown className={className} escapeHtml={false} source={source} />;

export const MarkdownViewer = styled(Viewer)`
    color: white;
    padding: 5px 20px 0 20px;
    text-align-last: ${props => (props.center ? "center" : "unset")};

    h1 {
        font-size: 32px;
        line-height: 47px;
        font-weight: 300;
        margin: 0px 0px 30px 0px;
    }

    p {
        font-size: 17px;
        font-weight: 300;
        line-height: 28px;
        text-align: justify;
    }

    img {
        max-width: 100%;
        border-radius: 1em;
        user-drag: none;
    }
`;
