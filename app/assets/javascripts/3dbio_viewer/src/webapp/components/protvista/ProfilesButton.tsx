import React from "react";
import i18n from "../../utils/i18n";
import { Dropdown, DropdownProps } from "../dropdown/Dropdown";

export interface ProfilesButtonProps {}

export const ProfilesButton: React.FC<ProfilesButtonProps> = () => {
    const items: DropdownProps["items"] = [
        { text: i18n.t("General"), id: "general", selected: true },
        { text: i18n.t("Structural"), id: "structural" },
        { text: i18n.t("Validation (em-computational models)"), id: "validation" },
        { text: i18n.t("Drug Design - Experimental"), id: "drug-design" },
        { text: i18n.t("Omics"), id: "omics" },
        { text: i18n.t("Biomedicine"), id: "biomedicine" },
    ];

    return (
        <Dropdown
            text={i18n.t("Profiles")}
            items={items}
            onClick={console.debug}
            showSelection={true}
        />
    );
};

/*
{isSelected && <Done />}
<span style={isSelected ? undefined : styles.menuItemSelected}>{item.text}</span>
*/
