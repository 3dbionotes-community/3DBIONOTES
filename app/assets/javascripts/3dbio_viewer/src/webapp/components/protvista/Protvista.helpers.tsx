import React from "react";
import _ from "lodash";
import { ProtvistaTrackElement } from "./Protvista.types";
import { PdbView } from "../../view-models/PdbView";

interface AddAction {
    type: "add";
    trackId: string;
}

export type ProtvistaAction = AddAction;

interface Options {
    onAction?(action: ProtvistaAction): void;
}

export function loadPdbView(
    elementRef: React.RefObject<ProtvistaTrackElement>,
    pdbView: PdbView,
    options: Options
) {
    const protvistaEl = elementRef.current;
    if (!protvistaEl) return;

    protvistaEl.viewerdata = pdbView;

    if (options.onAction) {
        protvistaEl.addEventListener("protvista-pdb.action", (ev: any) => {
            if (isProtvistaPdbActionEvent(ev) && options.onAction) {
                options.onAction(ev.detail);
            }
        });
    }
}

interface ProtvistaPdbActionEvent {
    detail: ProtvistaAction;
}

function isProtvistaPdbActionEvent(ev: any): ev is ProtvistaPdbActionEvent {
    return ev.detail && ev.detail.type === "add" && ev.detail.trackId;
}
