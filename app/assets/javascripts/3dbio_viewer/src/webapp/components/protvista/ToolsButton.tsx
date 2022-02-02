import React, { useEffect } from "react";
import i18n from "../../utils/i18n";
import { Dropdown, DropdownProps } from "../dropdown/Dropdown";
import { Network } from "../network/Network";
import { useBooleanState } from "../../hooks/use-boolean";
import { sendAnalytics } from "../../utils/analytics";

export interface ToolsButtonProps {}

export const ToolsButton: React.FC<ToolsButtonProps> = () => {
    const [isNetworkOpen, { enable: openNetwork, disable: closeNetwork }] = useBooleanState(false);
    const items: DropdownProps["items"] = [{ text: i18n.t("Network"), id: "network" }];

    useEffect(() => {
        if(isNetworkOpen) sendAnalytics({ type: "event", category: "clickMenu", action: "network", label: "view" });
        
    }, [isNetworkOpen]);

    return (
        <>
            <Dropdown text={i18n.t("Tools")} items={items} onClick={openNetwork} />
            {isNetworkOpen && <Network onClose={closeNetwork} />}
        </>
    );
};
