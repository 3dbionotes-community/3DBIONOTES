import React from "react";
import "./FrameViewer.css";

interface FrameViewerProps {
    title: string;
    src: string;
}

export const FrameViewer: React.FC<FrameViewerProps> = props => {
    const { title, src } = props;

    return (
        <div className="frame-viewer">
            <div className="title">{"> " + title}</div>

            <iframe src={src} width="95%" height="600" />
        </div>
    );
};
