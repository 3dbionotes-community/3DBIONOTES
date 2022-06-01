import React from "react";
import _ from "lodash";
import "./FrameViewer.css";

interface FrameViewerProps {
    name?: string;
    children?: React.ReactNode;
    title: string;
    src?: string;
    ref?: React.MutableRefObject<HTMLIFrameElement | null>;
}

export const FrameViewer = React.forwardRef<HTMLIFrameElement, FrameViewerProps>((props, ref) => {
    const { name, title, src, children } = props;

    return (
        <div className="frame-viewer">
            <div className="title">{"> " + title}</div>
            {children}

            <iframe name={name} ref={ref} src={src} width="95%" height="600" />
        </div>
    );
});

export function postToIFrame(options: {
    name: string;
    url: string;
    params: Record<string, string | undefined>;
}): void {
    const { name, url, params } = options;

    const form = document.createElement("form");
    form.method = "post";
    form.target = name;
    form.action = url;
    form.style.display = "none";

    _(params).forEach((value, key) => {
        if (!value) return;
        const input = document.createElement("input");
        input.type = "text";
        input.name = key;
        input.value = value;
        form.append(input);
    });

    document.body.append(form);
    form.submit();
    form.remove();
}
