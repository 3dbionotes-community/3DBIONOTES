import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { Accordion, AccordionDetails, AccordionSummary } from "@material-ui/core";
import { useBooleanState } from "../../hooks/use-boolean";
import "./FrameViewer.css";
import { TrackDef } from "../protvista/Protvista.types";

interface FrameViewerProps {
    name?: string;
    children?: React.ReactNode;
    title: string;
    src?: string;
    ref?: React.MutableRefObject<HTMLIFrameElement | null>;
    height?: number;
    trackDef: TrackDef;
}

export const FrameViewer = React.forwardRef<HTMLIFrameElement, FrameViewerProps>((props, ref) => {
    const { name, title, src, children, height, trackDef } = props;
    const [expanded, { toggle: toggleFrame }] = useBooleanState(true);
    const [defaultHeight, setDefaultHeight] = React.useState(0);

    const measuredHeight = React.useCallback((el: HTMLDivElement) => {
        if (el !== null) setDefaultHeight(el.getBoundingClientRect().height);
    }, []);

    return (
        <StyledWrapperAccordion className="frame-viewer" titleHeight={defaultHeight}>
            <StyledAccordion square expanded={expanded} onChange={toggleFrame}>
                <StyledAccordionSummary className="protvistaCol1">
                    <div className="title" ref={measuredHeight}>
                        <span>{title}</span>
                        {trackDef.description && (
                            <button className="viewer-track-help" title={trackDef.description}>
                                <i className="icon icon-common icon-question" />
                            </button>
                        )}
                    </div>
                    {expanded && (
                        <div>
                            {trackDef.subtracks.map((subtrack, idx) => (
                                <div key={idx} className="viewer-subtrack">
                                    {subtrack.name}
                                    <button className="subtrack-help" title={subtrack.description}>
                                        <i className="icon icon-common icon-question" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </StyledAccordionSummary>
                <AccordionDetails>
                    <div className="children">{expanded && children}</div>
                    <iframe name={name} ref={ref} src={src} width="100%" height={height ?? "600"} />
                </AccordionDetails>
            </StyledAccordion>
        </StyledWrapperAccordion>
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

const StyledAccordion = styled(Accordion)`
    & {
        display: flex;
    }

    &.MuiPaper-elevation1 {
        box-shadow: inherit;
    }

    & .MuiAccordionDetails-root {
        border-top: 0.5px solid #e2e2e2;
        padding: 0;
        width: 100%;
        position: relative;

        .children {
            position: absolute;
            right: 1em;
            top: 1em;
        }
    }

    & .MuiCollapse-container,
    & .MuiCollapse-root {
        flex-grow: 1;
    }
`;

interface StyledWrapperAccordionProps {
    titleHeight?: number;
}

const StyledWrapperAccordion = styled.div<StyledWrapperAccordionProps>`
    & .MuiCollapse-hidden {
        visibility: inherit;
        ${props =>
            props.titleHeight
                ? `height: ${props.titleHeight}px !important; min-height: ${props.titleHeight}px !important;`
                : ""}
    }
`;

const StyledAccordionSummary = styled(AccordionSummary)`
    & .title {
        span {
            flex-grow: 1;
        }
        display: flex;
        align-items: center;
        position: relative;
        padding: 0 1em;
        line-height: 22px;
        min-height: 45px;
        ::before {
            content: " ";
            display: inline-block;
            width: 10px;
            height: 10px;
            border-top: 5px solid transparent;
            border-bottom: 5px solid transparent;
            border-left: 5px solid #333;
            margin-right: 0.5em;
            box-sizing: border-box;
        }
        box-sizing: unset;
    }

    &.MuiAccordionSummary-root {
        border-top: 0.5px solid #fff;
        background: #f7f7f7;
        min-height: 45px;
        display: flex;
        align-items: flex-start;
        padding: 0;
        box-sizing: unset;
    }

    & .MuiAccordionSummary-content {
        display: flex;
        flex-direction: column;
        margin: 0;
        padding: 0;
        font-family: Helvetica, Arial, FreeSans, "Liberation Sans", sans-serif !important;
        box-sizing: unset;
        .title {
            background: #e2e2e2;
            line-height: 22px;
        }
    }

    & .MuiAccordionSummary-content.Mui-expanded {
        padding: 0;
        margin: 0;

        .title {
            background: #607d8b;
            color: #fff;
        }

        .title::before {
            content: " ";
            display: inline-block;
            width: 10px;
            height: 10px;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid #333;
            margin-right: 0.5em;
            box-sizing: border-box;
        }
        box-sizing: unset;
    }

    .viewer-subtrack {
        width: 60%;
        background-color: #f7f7f7;
        padding: 0.5em 1.2em 0.5em 1.8em;
        border-bottom: 1px solid #e2e2e2;
        line-height: 22px;
        cursor: pointer;
        position: relative;
        /*word-break: break-all;*/

        .subtrack-help {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: 0.5em;
            background-color: rgba(0, 0, 0, 0);
            color: #848a86;
            border: solid 1px #848a86;
            cursor: pointer;
        }
    }

    @media (max-width: 1800px) {
        &.MuiAccordionSummary-root {
            width: 20%;
            font-size: 90%;
        }
    }

    @media (max-width: 1400px) {
        &.MuiAccordionSummary-root {
            width: 22%;
            font-size: 90%;
        }
    }

    @media (max-width: 1100px) {
        &.MuiAccordionSummary-root {
            width: 25%;
            font-size: 75%;
        }
    }

    @media (max-width: 1000px) {
        &.MuiAccordionSummary-root {
            width: 27%;
            font-size: 70%;
        }
    }

    @media (max-width: 767px) {
        &.MuiAccordionSummary-root {
            width: 30%;
            font-size: 70%;
        }
    }
`;
