import React from "react";
import { Evidence } from "../../../domain/entities/Evidence";
import { Fragment, getFragmentToolsLink } from "../../../domain/entities/Fragment";
import i18n from "../../utils/i18n";
import { Link } from "../Link";

interface TooltipProps {
    protein: string;
    fragment: Fragment;
}

export const Tooltip: React.FC<TooltipProps> = React.memo(({ protein, fragment }) => {
    return (
        <EvidenceTable>
            <EvidenceRow title={i18n.t("Feature ID")} value={fragment.id} />
            <EvidenceRow title={i18n.t("Description")} value={fragment.description} />

            {(fragment.evidences || []).map((evidence, idx) => (
                <React.Fragment key={idx}>
                    <EvidenceRow title={i18n.t("Evidence")} value={evidence.title} />
                    <EvidenceSourceRow evidence={evidence} />
                    <EvidenceSourceRow evidence={evidence} alternative />
                </React.Fragment>
            ))}

            <EvidenceRow title={i18n.t("Tools")} object={getFragmentToolsLink(protein, fragment)}>
                {link => <Link name={link.name} url={link.url} />}
            </EvidenceRow>

            <EvidenceRow title={i18n.t("Legend")} object={fragment.legend}>
                {legend =>
                    legend.map(legendItem => (
                        <React.Fragment key={legendItem.text}>
                            <div
                                style={{ ...styles.tooltip, backgroundColor: legendItem.color }}
                            ></div>
                            <span>{legendItem.text}</span>
                            <br />
                        </React.Fragment>
                    ))
                }
            </EvidenceRow>
        </EvidenceTable>
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

const EvidenceTable: React.FC = props => {
    return <table className="tooltip">{props.children}</table>;
};

function EvidenceRow<Obj>(props: {
    title: string;
    value?: string;
    object?: Obj;
    children?: (obj: Obj) => React.ReactNode;
}) {
    const { title, value, object, children } = props;

    const valueCell = value || (object && children && children(object));
    if (!valueCell) return null;

    return (
        <tr>
            <td>{title}</td>
            <td>{valueCell}</td>
        </tr>
    );
}

const EvidenceSourceRow: React.FC<{ evidence: Evidence; alternative?: boolean }> = props => {
    const { evidence, alternative } = props;
    const source = alternative ? evidence.alternativeSource : evidence.source;
    if (!source) return null;

    return (
        <tr>
            <td></td>
            <td>
                {source.name}&nbsp;
                {source.links.map(link => (
                    <React.Fragment key={link.name}>
                        <Link name={link.name} url={link.url} />
                        &nbsp;
                    </React.Fragment>
                ))}
            </td>
        </tr>
    );
};
