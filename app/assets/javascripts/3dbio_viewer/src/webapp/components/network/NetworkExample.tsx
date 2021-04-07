import React from "react";
import i18n from "../../utils/i18n";
import "./Network.css";

interface NetworkExampleProps {
    onExampleClick: (e: string) => void;
}

const NetworkExample: React.FC<NetworkExampleProps> = React.memo(props => {
    const { onExampleClick } = props;
    return (
        <span id="network-example" onClick={() => onExampleClick("P01111 \nP01112 \nP01116")}>
            <small>{i18n.t("Example")}</small>
        </span>
    );
});

export default NetworkExample;
