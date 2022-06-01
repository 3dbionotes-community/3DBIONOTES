import React from "react";
import { getKeys } from "../../../utils/ts-utils";
import i18n from "../../utils/i18n";
import { Dropdown, DropdownProps } from "../dropdown/Dropdown";
import { graphFeatures, FeatureId } from "./ppi-data";

export interface FeaturesButtonProps {
    onClick(value: FeatureId): void;
}

export const FeaturesButton: React.FC<FeaturesButtonProps> = props => {
    const { onClick } = props;

    const dropdownItems: DropdownProps<FeatureId>["items"] = React.useMemo(() => {
        return getKeys(graphFeatures).map(key => {
            return { text: graphFeatures[key].text, id: key };
        });
    }, []);

    return <Dropdown<FeatureId> text={i18n.t("Feature")} items={dropdownItems} onClick={onClick} />;
};
