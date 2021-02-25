import React from "react";
import _ from "lodash";
import i18n from "../../utils/i18n";
import { Dropdown, DropdownProps } from "../dropdown/Dropdown";

export interface JumpToButtonProps {}

export const JumpToButton: React.FC<JumpToButtonProps> = () => {
    const items: DropdownProps["items"] = React.useMemo(() => {
        return [
            { id: "generalInfo", text: i18n.t("General information") },
            { id: "structuralInfo", text: i18n.t("Structural information") },
            { id: "mapValidation", text: i18n.t("Map validation") },
            { id: "ppiViewer", text: i18n.t("PPI viewer") },
        ];
    }, []);

    return <Dropdown text={i18n.t("Jump to")} items={items} onClick={goToElement} />;
};

function goToElement(DOMElementId: string) {
    // Use document.getElementById for simplicity. The orthodox approach would be to use refs,
    // but we'd need to pass them to all components that have an anchor.
    const el = document.getElementById(DOMElementId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
}
