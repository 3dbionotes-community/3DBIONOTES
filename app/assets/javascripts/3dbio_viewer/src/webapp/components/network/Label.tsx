import React from "react";
import i18n from "../../utils/i18n";
import "./Network.css";

interface LabelProps {
    forText: string;
    labelText: string;
}

const Label: React.FC<LabelProps> = React.memo(props => {
    const { forText, labelText } = props;
    return (
        <label htmlFor={forText}>
            <strong>{i18n.t(labelText)}</strong>
        </label>
    );
});

export default Label;
