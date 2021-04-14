import React from "react";
import { Evidence } from "../../../domain/entities/Evidence";
import { Fragment, getFragmentToolsLink } from "../../../domain/entities/Fragment";
import { Fragment2, getConflict } from "../../../domain/entities/Fragment2";
import { Pdb } from "../../../domain/entities/Pdb";
import { Subtrack } from "../../../domain/entities/Track";
import i18n from "../../utils/i18n";
import { renderJoin } from "../../utils/react";
import { Link } from "../Link";

interface TooltipProps {
    pdb: Pdb;
    subtrack: Subtrack;
    fragment: Fragment | Fragment2;
}

export const Tooltip: React.FC<TooltipProps> = React.memo(props => {
    const { pdb, subtrack, fragment } = props;
    return (
        <EvidenceTable>
            <EvidenceRow title={i18n.t("Feature ID")} value={fragment.id} className="description" />
            <EvidenceRow title={i18n.t("Description")} value={fragment.description} />
            <EvidenceRow title={i18n.t("Conflict")} value={getConflict(pdb.sequence, fragment)} />

            <EvidenceRow title={i18n.t("Source")} object={subtrack.source}>
                {source =>
                    typeof source === "string" ? null : (
                        <div>
                            <img src={source.icon} /> <Link name={source.url} url={source.url} />
                        </div>
                    )
                }
            </EvidenceRow>

            {(fragment.evidences || []).map((evidence, idx) => (
                <React.Fragment key={idx}>
                    <EvidenceRow title={i18n.t("Evidence")} value={evidence.title} />
                    <EvidenceSourceRow evidence={evidence} />
                    <EvidenceSourceRow evidence={evidence} alternative />
                </React.Fragment>
            ))}

            <EvidenceRow
                title={i18n.t("Tools")}
                object={getFragmentToolsLink({ protein: pdb.protein.id, subtrack, fragment })}
            >
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
    className?: string;
    children?: (obj: Obj) => React.ReactNode;
}) {
    const { title, value, object, children, className } = props;

    const childrenContent = object && children && children(object);
    if (!value && !childrenContent) return null;

    return (
        <tr className={className}>
            <td>{title}</td>
            <td>
                {value && <span dangerouslySetInnerHTML={{ __html: value }}></span>}
                {childrenContent}
            </td>
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
                {renderJoin(
                    source.links.map(link => (
                        <React.Fragment key={link.name}>
                            <Link name={link.name} url={link.url} />
                        </React.Fragment>
                    )),
                    <span> | </span>
                )}
            </td>
        </tr>
    );
};
