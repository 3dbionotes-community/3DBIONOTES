import React from "react";
import { Fragment } from "../../../domain/entities/Fragment";
import { Subtrack } from "../../../domain/entities/Track";
import i18n from "../../utils/i18n";

/* Original tooltip logic & DOM: myProtVista/src/TooltipFactory.js */

interface TooltipProps {
    subtrack: Subtrack;
    fragment: Fragment;
}

export const Tooltip: React.FC<TooltipProps> = React.memo(({ subtrack, fragment }) => {
    return (
        <table>
            <tr>
                <td>{i18n.t("Description")}</td>
                <td>{fragment.description}</td>
            </tr>

            {(fragment.evidences || []).map((evidence, idx) => (
                <React.Fragment key={idx}>
                    <tr>
                        <td>{i18n.t("Evidence")}</td>
                        <td>{evidence.title}</td>
                    </tr>
                    {evidence.source && (
                        <tr key={idx}>
                            <td></td>
                            <td>
                                {evidence.source.name}&nbsp;
                                <a href={evidence.source.url} target="_blank" rel="noreferrer">
                                    {evidence.source.id}
                                </a>
                            </td>
                        </tr>
                    )}
                    {evidence.alternativeSource && (
                        <tr key={idx}>
                            <td></td>
                            <td>
                                {evidence.alternativeSource.name}
                                &nbsp;
                                <a
                                    href={evidence.alternativeSource.url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {evidence.alternativeSource.id}
                                </a>
                            </td>
                        </tr>
                    )}
                </React.Fragment>
            ))}

            {subtrack.tools && (
                <tr>
                    <td>{i18n.t("Tools")}</td>
                    <td>{subtrack.tools}</td>
                </tr>
            )}

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
