import React from "react";
import classNames from "classnames";

export const External: React.FC<{ text: string; icon: ExternalIcon }> = props => {
    const iconClassName = props.icon === "external" ? "fa-external-link-square" : "fa-eye";
    return (
        <React.Fragment>
            <span style={{ marginRight: 5 }}>{props.text}</span>
            <i className={classNames("fa", iconClassName)} />
        </React.Fragment>
    );
};
export type ExternalIcon = "external" | "viewer";
