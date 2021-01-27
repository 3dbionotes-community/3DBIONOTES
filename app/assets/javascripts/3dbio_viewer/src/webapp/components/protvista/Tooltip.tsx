import React from "react";
import { Fragment } from "../../../domain/entities/Fragment";
import i18n from "../../utils/i18n";

export const Tooltip: React.FC<{ fragment: Fragment }> = React.memo(({ fragment }) => {
    return (
        <table>
            <tr>
                <td>{i18n.t("Description")}</td>
                <td>{fragment.description}</td>
            </tr>

            {fragment.legend && (
                <tr>
                    <td>{i18n.t("Legend")}</td>
                    <td>
                        {fragment.legend.map(legendItem => (
                            <React.Fragment key={legendItem.text}>
                                <div
                                    style={{ ...styles.tooltip, backgroundColor: legendItem.color }}
                                ></div>
                                <span>{legendItem.text}</span>
                                <br />
                            </React.Fragment>
                        ))}
                    </td>
                </tr>
            )}
        </table>
    );
});

const styles = {
    tooltip: {
        borderColor: "black",
        display: "inline-flex",
        width: 10,
        borderWidth: 1,
        height: 10,
        marginRight: 5,
    },
};
