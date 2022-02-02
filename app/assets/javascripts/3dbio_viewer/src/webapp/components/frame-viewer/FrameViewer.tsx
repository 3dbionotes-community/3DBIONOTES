import React from "react";
import "./FrameViewer.css";

interface FrameViewerProps {
    children?: React.ReactNode;
    title: string;
    src: string;
    ref?: React.MutableRefObject<HTMLIFrameElement | null>;
}

export const FrameViewer = React.forwardRef<HTMLIFrameElement, FrameViewerProps>((props, ref) => {
    const { title, src, children } = props;
    console.log(children)
    console.log(title)

    return (
        <div className="frame-viewer">
            <div className="title">{"> " + title}</div>
            {children}

            <iframe ref={ref} src={src} width="95%" height="600" />
        </div>
    );
});
