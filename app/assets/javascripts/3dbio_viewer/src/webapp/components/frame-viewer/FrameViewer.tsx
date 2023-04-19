import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { Accordion, AccordionDetails, AccordionSummary } from "@material-ui/core";
import { useBooleanState } from "../../hooks/use-boolean";
import "./FrameViewer.css";

interface FrameViewerProps {
    name?: string;
    children?: React.ReactNode;
    title: string;
    src?: string;
    ref?: React.MutableRefObject<HTMLIFrameElement | null>;
    height?: number;
}

export const FrameViewer = React.forwardRef<HTMLIFrameElement, FrameViewerProps>((props, ref) => {
    const { name, title, src, children, height } = props;
    const [expanded, { toggle: toggleFrame }] = useBooleanState(true);

    return (
        <div className="frame-viewer">
            <StyledAccordion square expanded={expanded} onChange={toggleFrame}>
                <StyledAccordionSummary>
                    <div className="title">{title}</div>
                </StyledAccordionSummary>
                <AccordionDetails>
                    <div className="children">{expanded && children}</div>
                    <iframe name={name} ref={ref} src={src} width="100%" height={height ?? "600"} />
                </AccordionDetails>
            </StyledAccordion>
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

    & .MuiCollapse-container {
        flex-grow: 1;
    }

    & .MuiCollapse-hidden {
        visibility: inherit;
        height: 45px !important;
        min-height: 45px !important;
    }
`;

const StyledAccordionSummary = styled(AccordionSummary)`
    & .title {
        ::before {
            content: " ";
            display: inline-block;
            width: 0;
            height: 0;
            border-top: 5px solid transparent;
            border-bottom: 5px solid transparent;
            border-left: 5px solid #333;
            margin-right: 8px;
            -webkit-transition: all 0.1s;
            /* Safari */
            transition: all 0.1s;
        }
    }

    &.MuiAccordionSummary-root {
        border-top: 0.5px solid #fff;
        background: #f7f7f7;
        min-height: 0;
        width: 15%;
        box-sizing: border-box;
        display: flex;
        align-items: flex-start;
        padding: 0;
    }

    & .MuiAccordionSummary-content {
        height: 45px;
        max-height: 45px;
        min-height: 45px;
        box-sizing: border-box;
        padding: 0.8em 1.3em 0.8em 0.8em;
        background: #e2e2e2;
        margin: 0;
        line-height: 22px;
        font-family: Helvetica, Arial, FreeSans, "Liberation Sans", sans-serif !important;
    }

    & .MuiAccordionSummary-content.Mui-expanded {
        padding: 0.8em 1.3em 0.8em 0.8em;
        margin: 0;
        background: #607d8b;
        color: #fff;

        .title::before {
            content: " ";
            display: inline-block;
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid #333;
            margin-right: 8px;
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

// .track-label {
//     background-color: #d9faff;
//     padding: 0.5em 1.2em 0.5em 1.8em;
//     cursor:pointer;
//     position: relative;
// }

// .category-label.pdbIconsLabel, .track-label.pdbIconsLabel {
//     border-left: 1px solid #b2f5ff;
//     border-right: 1px solid #b2f5ff;
//     background-color: #fff;
// }

// .aggregate-track-content, .track-content-single {
//     opacity: 1;
//     -webkit-transition: opacity .1s;
//     /* Safari */
//     transition: opacity .1s;
//     border-bottom: 1px solid #b2f5ff;
// }

// .aggregate-track-content{
//     padding-bottom: 5px;
// }

// .track-label, .track-content {
//     border-bottom: 1px solid #b2f5ff;
// }

// .top-border {
//     border-top: 1px solid #b2f5ff;
// }

// .is-hidden{
//     display: none!important;
// }

// .pdbIcon {
//     display: inline-block;
//     padding: 5px 4px;
// }

// .pdbIcon i {
//     color: #fff;
//     font-size: 21px;
// }

// .pdbIcon.rotate i {
//     filter: progid: DXImageTransform.Microsoft.BasicImage(rotation=1);
//     -webkit-transform: rotate(90deg);
//     -moz-transform: rotate(90deg);
//     -ms-transform: rotate(90deg);
//     -o-transform: rotate(90deg);
//     transform: rotate(90deg);
//     display: inline-block;
// }

// .legendRow{
//     min-height: 30px;
//     line-height: 30px;
// }

// .legendColor {
//     display: inline-block;
//     height:10px;
//     width:26px;
// }

// .legendText{
//     /* min-width: 135px; */
//     display: inline-block;
//     font-size: 90%;
//     text-align: left;
//     color:#333;
//     margin-left: 2px;
// }

// .protvistaRowGroup{
//     max-height: 210px;
//     overflow-y: auto;
//     clear: both;
//     display: none;
// }

// .protvistaRowGroup.noPaddingRight > .protvistaRow > .protvistaCol2 {
//     padding-right: 0 !important;
// }

// .labelZoomIcon{
//     position: absolute;
//     left: 5px;
//     cursor: zoom-in;
//     color: #848a86;
//     top: 50%;
//     transform: translateY(-50%);
//     font-size: 12px;
// }

// .labelZoomIcon.active{
//     cursor: zoom-out!important;
//     color: #009e38!important;
// }

// .hideLabelIcon{
//     position: absolute;
//     right: 5px;
//     cursor: pointer;
//     color: #848a86;
//     top: 10%;
//     transform: translateY(-10%);
//     font-size: 10px;
// }

// .protvistaResetSectionIcon{
//     position: absolute;
//     border: 1px solid #828181;
//     background-color: #828181;
//     border-radius: 50%;
//     cursor: pointer;
//     text-align: center;
//     text-align: center;
//     width: 20px;
//     height: 20px;
//     line-height: 19px;
//     right: 10px;
//     display: none;
// }

// .protvistaResetSectionIcon i{
//     color: #fff;
//     cursor: pointer;
//     font-size:80%;
// }

// .protvistaToolbar{
//     text-align: right;
// }

// .protvistaToolbarIcon{
//     display: inline-block;
//     border: 1px solid #828181;
//     background-color: #828181;
//     border-radius: 50%;
//     margin-right: 10px;
//     cursor: pointer;
//     text-align: center;
//     text-align: center;
//     width: 30px;
//     height: 30px;
//     line-height: 28px;
// }

// .protvistaToolbar i{
//     color: #fff;
//     cursor: pointer;
//     margin:2px;
// }

// .protvistaRangeMenuTitle{
//     position: relative;
//     color: #1b1919;
// }

// .protvistaRangeMenuTitle > div{
//     padding: 10px 10px 0 10px;
// }

// .protvistaRangeMenuTitle > div:first-child{
//     font-weight: bold;
//     text-align: left;
// }

// .protvistaMenuClose{
//     position: absolute;
//     right: 10px;
//     top: 14px;
//     color: #6d6d6d;
//     font-size: 12px;
//     cursor: pointer;
// }

// .protvistaForm{
//     padding: 10px;
//     font-size: 12px;
//     max-height: 300px;
//     overflow: auto;
//     text-align: left;
//     font-weight: 600;
//     color: #444;
// }

// .divWithScroll {
//     position: relative;
//     clear: both;
//     overflow-y: scroll;
//     height:40px;
// }

// .label-tooltip .label-tooltip-text {
//     visibility: hidden;
//     /*white-space: nowrap;*/
//     width: 400px;
//     background-color: black;
//     color: #fff;
//     text-align: center;
//     border-radius: 6px;
//     padding: 5px;
//     position: absolute;
//     z-index: 1;
//     top: 5px;
//     left: 100%;
// }

// .label-tooltip .label-tooltip-text::after {
//     content: "";
//     position: absolute;
//     top: 50%;
//     right: 100%;
//     margin-top: -5px;
//     border-width: 5px;
//     border-style: solid;
//     border-color: transparent black transparent transparent;
// }

// .label-tooltip:hover .label-tooltip-text {
//     visibility: visible;
// }

// .protvista-pdb protvista-pdb-navigation .handle,
// .protvista-pdb protvista-navigation .handle {
//     fill: darkgray;
//     height: 19px !important;
//     stroke: black;
// }

// protvista-tooltip {
//     z-index: 50000;
//     position: absolute;
//     min-width: 220px;
//     max-width: 350px;
//     margin-top: 20px;
//     margin-left: -20px;
//     -webkit-box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
//     -moz-box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
//     box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
//     /*opacity: .9;*/
// }

// protvista-tooltip[mirror="H"] {
//     margin-left: 0;
//     margin-right: 20px;
// }

// protvista-tooltip .tooltip-header .tooltip-header-title{
//     color: #ffffff;
// }

// /* protvista-tooltip a,
// protvista-tooltip a:link,
// protvista-tooltip a:hover,
// protvista-tooltip a:active,
// protvista-tooltip a:visited {
//     color: #ffffff;
// } */

// protvista-tooltip .tooltip-body {
//     /* color: #ffffff; */
//     color: #555;
// }

// protvista-tooltip .tooltip-header {
//     background-color: #595959;
//     line-height: 3em;
// }

// /* protvista-tooltip .tooltip-header::before {
//     content: " ";
//     position: absolute;
//     bottom: 100%;
//     left: 20px;
//     margin-left: -10px;
//     border-width: 10px;
//     border-style: solid;
//     border-color: transparent transparent black transparent;
// } */

// protvista-tooltip[mirror="H"] .tooltip-header::before {
//     left: initial;
//     right: 20px;
// }

// protvista-tooltip .tooltip-header .tooltip-header-title {
//     /* background-color: #000000;
//     font-weight: 700;
//     line-height: 1em;
//     display: inline-block;
//     vertical-align: middle;
//     padding-left: .4em; */
//     font-weight: 400;
//     white-space: nowrap;
//     letter-spacing: .05em;
//     font-size: 1.1em;
//     background-color: #595959;
//     line-height: 2em;
//     padding: 0 .7em;
//     color: #FFF;
// }

// protvista-tooltip .tooltip-body {
//     padding: 1em;
//     background: #FFF;
//     font-weight: normal;
//     max-height: 160px;
//     overflow-x: hidden;
//     overflow-y: auto;
// }

// protvista-tooltip .tooltip-close {
//     height: 3em;
//     width: 3em;
//     display: inline-block;
//     background-repeat: no-repeat;
//     background-position: center;
//     background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTdweCIgaGVpZ2h0PSIxN3B4IiB2aWV3Qm94PSIwIDAgMTcgMTciIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDQ4LjIgKDQ3MzI3KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5BcnRib2FyZDwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiPgogICAgICAgIDxnIGlkPSJBcnRib2FyZCIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjIiPgogICAgICAgICAgICA8ZyBpZD0iR3JvdXAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIuMDAwMDAwLCAyLjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTAuNDMxODE4MTgyLDAuNDMxODE4MTgyIEwxMi41MTAzNTM0LDEyLjUxMDM1MzQiIGlkPSJMaW5lIj48L3BhdGg+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMC40MzE4MTgxODIsMC40MzE4MTgxODIgTDEyLjUxMDM1MzQsMTIuNTEwMzUzNCIgaWQ9IkxpbmUtQ29weSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNi41MDAwMDAsIDYuNTAwMDAwKSBzY2FsZSgtMSwgMSkgdHJhbnNsYXRlKC02LjUwMDAwMCwgLTYuNTAwMDAwKSAiPjwvcGF0aD4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+);
//     cursor: pointer;
//     vertical-align: middle;
// }

// protvista-tooltip .tooltip-close:hover {
//     background-color: #1a1a1a;
// }

// protvista-tooltip table td {
//     padding: .5em .5em;
//     vertical-align: top;
// }

// protvista-tooltip table td:first-child {
//     font-weight: 600;
//     text-align: right
// }
