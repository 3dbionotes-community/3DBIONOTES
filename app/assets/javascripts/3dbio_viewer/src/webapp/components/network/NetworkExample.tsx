import React from "react";
import i18n from "../../utils/i18n";
import "./Network.css";

interface NetworkExampleProps {
    onExampleClick: (e: string) => void;
}

const NetworkExample: React.FC<NetworkExampleProps> = React.memo(props => {
    const { onExampleClick } = props;
    return (
        <span
            className="network-example"
            onClick={() => onExampleClick(["P01111", "P01112", "P01116"].join("\n"))}
        >
            <small className="network-example">{i18n.t("Example")}</small>
        </span>
    );
});

export default NetworkExample;
