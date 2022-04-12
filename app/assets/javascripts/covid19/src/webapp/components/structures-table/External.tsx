import React from "react";
import classNames from "classnames";

export interface ExternalProps {
    text?: string;
    icon?: ExternalIcon;
}

export const External: React.FC<ExternalProps> = React.memo(props => {
    const { text, icon } = props;
    const iconClassName = React.useMemo(
        () =>
            (icon === "external" ? "fa-external-link-square" : "fa-eye") +
            (text ? " icon-right" : ""),
        []
    );

    return (
        <React.Fragment>
            {text}
            {icon && <i className={classNames("fa", iconClassName)} />}
        </React.Fragment>
    );
});

export type ExternalIcon = "external" | "viewer";
