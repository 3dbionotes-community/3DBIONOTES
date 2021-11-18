import React from "react";
import classNames from "classnames";

export interface ExternalProps {
    text?: string;
    icon?: ExternalIcon;
}

export const External: React.FC<ExternalProps> = React.memo(props => {
    const { text, icon } = props;
    const iconClassName = icon === "external" ? "fa-external-link-square" : "fa-eye";

    return (
        <React.Fragment>
            {text && <span style={styles.text}>{text}</span>}
            {icon && <i className={classNames("fa", iconClassName)} />}
        </React.Fragment>
    );
});

export type ExternalIcon = "external" | "viewer";

const styles = {
    text: { marginRight: 5 },
};
