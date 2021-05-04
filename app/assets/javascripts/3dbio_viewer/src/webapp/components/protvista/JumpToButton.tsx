import React from "react";
import _ from "lodash";
import i18n from "../../utils/i18n";
import { Dropdown, DropdownProps } from "../dropdown/Dropdown";
import { BlockDef } from "./Protvista.types";

export interface JumpToButtonProps {
    blocks: BlockDef[];
}

export const JumpToButton: React.FC<JumpToButtonProps> = React.memo(props => {
    const { blocks } = props;
    const items: DropdownProps["items"] = React.useMemo(() => {
        return blocks.map(block => ({ id: block.id, text: block.title }));
    }, [blocks]);

    return <Dropdown text={i18n.t("Jump to")} items={items} onClick={goToElement} />;
});

function goToElement(DOMElementId: string) {
    // Use document.getElementById for simplicity. The orthodox approach would be to use refs,
    // but we'd need to pass them to all components that have an anchor.
    const el = document.getElementById(DOMElementId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
}
