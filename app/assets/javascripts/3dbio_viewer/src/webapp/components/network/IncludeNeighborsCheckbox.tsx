import React from "react";
import i18n from "../../utils/i18n";
import "./Network.css";

interface IncludeNeighborsCheckboxProps {
    checked: boolean;
    onChange: () => void;
}

const IncludeNeighborsCheckbox: React.FC<IncludeNeighborsCheckboxProps> = React.memo(props => {
    const { checked, onChange } = props;

    return (
        <div className="include-neighbors-checkbox">
            <input id="include-neighbors" type="checkbox" checked={checked} onChange={onChange} />
            <label htmlFor="include-neighbors" className="margin-checkbox-label">
                {i18n.t("Include neighbours with structural data")}
            </label>
        </div>
    );
});

export default IncludeNeighborsCheckbox;
