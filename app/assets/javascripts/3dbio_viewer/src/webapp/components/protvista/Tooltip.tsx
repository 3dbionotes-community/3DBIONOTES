import React from "react";
import _ from "lodash";
import { Reference } from "../../../domain/entities/Evidence";
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
    fragment: FragmentP;
}

type FragmentP = Fragment | Fragment2;

export const Tooltip: React.FC<TooltipProps> = React.memo(props => {
    const { pdb, subtrack, fragment } = props;
    const { description, alignmentScore } = fragment;
    const score = alignmentScore ? alignmentScore + " %" : undefined;

    return (
        <TooltipTable>
            <TooltipRow title={i18n.t("Feature ID")} value={fragment.id} className="description" />
            <TooltipRow title={i18n.t("Description")} value={description} />
            <TooltipRow title={i18n.t("Alignment score")} value={score} className="description" />
            <TooltipRow title={i18n.t("Conflict")} value={getConflict(pdb.sequence, fragment)} />
            <Source subtrack={subtrack} />
            <Evidences fragment={fragment} />
            <CrossReferences fragment={fragment} />
            <Tools pdb={pdb} subtrack={subtrack} fragment={fragment} />
            <Legend fragment={fragment} />
        </TooltipTable>
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

const TooltipTable: React.FC = props => {
    return <table className="tooltip">{props.children}</table>;
};

const Legend: React.FC<{ fragment: FragmentP }> = props => {
    return (
        <TooltipRow title={i18n.t("Legend")} object={props.fragment.legend}>
            {legend =>
                legend.map(legendItem => (
                    <React.Fragment key={legendItem.text}>
                        <div style={{ ...styles.tooltip, backgroundColor: legendItem.color }}></div>
                        <span>{legendItem.text}</span>
                        <br />
                    </React.Fragment>
                ))
            }
        </TooltipRow>
    );
};

const Tools: React.FC<{ pdb: Pdb; subtrack: Subtrack; fragment: FragmentP }> = props => {
    const { pdb, subtrack, fragment } = props;

    return (
        <TooltipRow
            title={i18n.t("Tools")}
            object={
                pdb.protein
                    ? getFragmentToolsLink({ protein: pdb.protein.id, subtrack, fragment })
                    : undefined
            }
        >
            {link => <Link name={link.name} url={link.url} />}
        </TooltipRow>
    );
};

const CrossReferences: React.FC<{ fragment: FragmentP }> = props => {
    const { crossReferences = [] } = props.fragment;
    const [headCrossReferences, restCrossReferences] = React.useMemo(() => {
        return [_.take(crossReferences, 1), _.drop(crossReferences, 1)];
    }, [crossReferences]);
    if (_.isEmpty(headCrossReferences)) return null;

    return (
        <React.Fragment>
            <ReferencesRows title={i18n.t("Cross-references")} sources={headCrossReferences} />
            <ReferencesRows sources={restCrossReferences} />
        </React.Fragment>
    );
};

const Evidences: React.FC<{ fragment: FragmentP }> = props => {
    return (
        <React.Fragment>
            {(props.fragment.evidences || []).map((evidence, idx) => (
                <React.Fragment key={idx}>
                    <TooltipRow title={i18n.t("Evidence")} value={evidence.title} />
                    <ReferencesRows sources={evidence.sources} />
                </React.Fragment>
            ))}
        </React.Fragment>
    );
};

const Source: React.FC<{ subtrack: Subtrack }> = props => {
    return (
        <TooltipRow title={i18n.t("Source")} object={props.subtrack.source}>
            {source =>
                typeof source === "string" ? null : (
                    <div>
                        <img src={source.icon} /> <Link name={source.url} url={source.url} />
                    </div>
                )
            }
        </TooltipRow>
    );
};

function TooltipRow<Obj>(props: {
    title: string;
    value?: string;
    object?: Obj;
    className?: string;
    children?: (obj: Obj) => React.ReactNode;
}): React.ReactElement | null {
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

const ReferencesRows: React.FC<{ title?: string; sources: Reference[] }> = props => {
    const { title, sources } = props;

    return (
        <React.Fragment>
            {sources.map((source, idx) => (
                <tr key={idx}>
                    <td>{title}</td>
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
            ))}
        </React.Fragment>
    );
};
