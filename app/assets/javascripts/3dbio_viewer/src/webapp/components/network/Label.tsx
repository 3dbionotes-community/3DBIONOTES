import React from "react";
import i18n from "../../utils/i18n";
import "./Network.css";

interface LabelProps {
    forText: string;
    label: string;
}

const Label: React.FC<LabelProps> = React.memo(props => {
    const { forText, label } = props;
    return (
        <label htmlFor={forText}>
            <strong>{i18n.t(label)}</strong>
        </label>
    );
});

export default Label;
