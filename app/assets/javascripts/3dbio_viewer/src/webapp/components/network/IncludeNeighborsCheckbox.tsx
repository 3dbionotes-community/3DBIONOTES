import React from "react";
import i18n from "../../utils/i18n";
import "./Network.css";

interface IncludeNeighborsCheckboxProps {
    checkedValue: boolean;
    onCheckboxChange: () => void;
}

const IncludeNeighborsCheckbox: React.FC<IncludeNeighborsCheckboxProps> = React.memo(props => {
    const { checkedValue, onCheckboxChange } = props;
    return (
        <div className="include-neighbors-checkbox">
            <input
                type="checkbox"
                className="include-neighbors-checkbox"
                checked={checkedValue}
                onChange={onCheckboxChange}
            />
            <label>{i18n.t("Include neighbours with structural data")}</label>
        </div>
    );
});

export default IncludeNeighborsCheckbox;
