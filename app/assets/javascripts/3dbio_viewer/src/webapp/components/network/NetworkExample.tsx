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
            id="network-example"
            onClick={() => onExampleClick(["P01111", "P01112", "P01116"].join("\n"))}
        >
            <small>{i18n.t("Example")}</small>
        </span>
    );
});

export default NetworkExample;
