import React from "react";
import _ from "lodash";
import { ArrowForward as ArrowForwardIcon } from "@material-ui/icons";
import { Dropdown, DropdownProps } from "../dropdown/Dropdown";
import { BlockDef } from "./Protvista.types";
import { sendAnalytics } from "../../utils/analytics";
import i18n from "../../utils/i18n";

export interface JumpToButtonProps {
    blocks: BlockDef[];
    expanded: boolean;
}

export const JumpToButton: React.FC<JumpToButtonProps> = React.memo(({ blocks, expanded }) => {
    const items: DropdownProps["items"] = React.useMemo(() => {
        return blocks.map(block => ({
            id: block.id,
            text: block.title.replaceAll(/\s*\$\{.*\}/g, ""),
        }));
    }, [blocks]);

    return (
        <Dropdown
            text={i18n.t("Jump to")}
            items={items}
            onClick={goToElement}
            rightIcon={<ArrowForwardIcon fontSize="small" />}
            expanded={expanded}
        />
    );
});

export function goToElement(DOMElementId: string) {
    // Use document.getElementById for simplicity. The orthodox approach would be to use refs,
    // but we'd need to pass them to all components that have an anchor.
    sendAnalytics("jump_to", {
        on: "viewer",
        label: DOMElementId,
    });
    const el = document.getElementById(DOMElementId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
}
