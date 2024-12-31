import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { InfoOutlined as InfoOutlinedIcon } from "@material-ui/icons";
import { Reference } from "../../../domain/entities/Evidence";
import { Fragment, getFragmentToolsLink } from "../../../domain/entities/Fragment";
import { Fragment2, Interval, getConflict } from "../../../domain/entities/Fragment2";
import { Pdb } from "../../../domain/entities/Pdb";
import { Subtrack } from "../../../domain/entities/Track";
import { renderJoin } from "../../utils/react";
import { Link } from "../Link";
import { Protein } from "../../../domain/entities/Protein";
import { trackDefinitions } from "../../../domain/definitions/tracks";
import { getSource, Source as SourceEntity } from "../../../domain/entities/Source";
import i18n from "../../utils/i18n";

interface TooltipProps {
    pdb: Pdb;
    subtrack: Subtrack;
    fragment: FragmentP;
    alignment: Interval[];
    sources: SourceEntity[];
}

type FragmentP = Fragment | Fragment2;

export const Tooltip: React.FC<TooltipProps> = React.memo(props => {
    //cannot use sources from AppContext as context is not initalized
    const { pdb, subtrack, fragment, alignment, sources } = props;
    const { description, alignmentScore } = fragment;

    //no react.memo as is finally rendered to string
    const nmrSource = getSource(sources, "NMR");
    const score = alignmentScore ? alignmentScore + " %" : undefined; // aligmentScore is never being set on code
    const isStructureCoverage = subtrack.accession === trackDefinitions.structureCoverage.id;
    const isNMR = subtrack.accession === "nmr";

    const isCovered =
        isStructureCoverage ||
        alignment.some(
            interval => fragment.start >= interval.start && fragment.end <= interval.end
        );

    const isPartiallyCovered = alignment.some(
        interval => fragment.start <= interval.end && fragment.end >= interval.start
    );

    const isNotCovered = alignment.every(
        interval => fragment.start > interval.end || fragment.end < interval.start
    );

    const coverage = isNotCovered
        ? {
            value: i18n.t("Not in Structure Coverage"),
            className: "error",
            title: i18n.t(
                "This annotation is part of the full UniProt sequence but lies outside the region captured in the 3D structure (PDB) for this specific chain. It may correspond to a flexible, disordered, or missing part of the protein that was not resolved during structure determination."
            ),
        }
        : isPartiallyCovered && !isCovered
            ? {
                value: i18n.t("Partially in Structure Coverage"),
                className: "warning",
                title: i18n.t(
                    "This annotation is partially covered by the 3D structure (PDB) for this specific chain. The structure may capture part of this region, but additional functional or structural details extend beyond the resolved area."
                ),
            }
            : undefined;

    return (
        <TooltipTable>
            {coverage && (
                <TooltipRow
                    title={i18n.t("Alignment")}
                    value={coverage.value}
                    className={coverage.className}
                    object={{ title: coverage.title }}
                >
                    {info => <InfoOutlinedIcon fontSize="small" titleAccess={info.title} />}
                </TooltipRow>
            )}
            <TooltipRow title={i18n.t("Feature ID")} value={fragment.id} className="description" />
            <TooltipRow
                title={isNMR ? i18n.t("Target") : i18n.t("Description")}
                value={description}
            />
            <TooltipRow title={i18n.t("Alignment score")} value={score} className="description" />
            <TooltipRow title={i18n.t("Conflict")} value={getConflict(pdb.sequence, fragment)} />
            <Source subtrack={subtrack} />
            <Evidences fragment={fragment} />
            <CrossReferences fragment={fragment} />
            {pdb.protein && <Tools protein={pdb.protein} subtrack={subtrack} fragment={fragment} />}
            <Legend fragment={fragment} />
            {isNMR && nmrSource && (
                <NMR start={fragment.start} end={fragment.end} nmrSource={nmrSource} />
            )}
        </TooltipTable>
    );
});

const NMR: React.FC<{ start: number; end: number; nmrSource: SourceEntity }> = props => {
    const { nmrSource } = props;
    const nmrMethod = nmrSource?.methods[0];

    if (!nmrMethod) return null;

    return (
        <>
            <TooltipRow
                title={i18n.t("Description")}
                value={nmrMethod.description}
                className="description"
            />
            <TooltipRow title={i18n.t("Evidence")} object={nmrMethod}>
                {nmrMethod => <Link name={nmrMethod.externalLink} url={nmrMethod.externalLink} />}
            </TooltipRow>
            <TooltipRow
                title={i18n.t("Source")}
                value={nmrSource.description}
                className="description"
            />
            <tr>
                <td>{i18n.t("Tools")}</td>
                <td>
                    <ButtonLink className="anchor" data-start={props.start} data-end={props.end}>
                        {i18n.t("Library of tested ligands")}
                    </ButtonLink>
                </td>
            </tr>
        </>
    );
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

const Tools: React.FC<{ protein: Protein; subtrack: Subtrack; fragment: FragmentP }> = props => {
    const { protein, subtrack, fragment } = props;

    return (
        <TooltipRow
            title={i18n.t("Tools")}
            object={getFragmentToolsLink({ protein: protein.id, subtrack, fragment })}
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

const InfoIcon: React.FC<{ title: string }> = props => (
    <svg {...props}>
        <title>{props.title}</title>
        {props.children}
    </svg>
);

const ButtonLink = styled.button`
    margin: 0;
    padding: 0;
    font-weight: normal;
`;

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