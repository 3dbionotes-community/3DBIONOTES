import _ from "lodash";
import React from "react";
import { CellProps } from "../Columns";
import { Link } from "../Link";
import { Wrapper } from "./Wrapper";
import { BadgeEntities, OnClickNMR } from "../badge/BadgeEntities";
import { HtmlTooltip } from "../HtmlTooltip";
import {
    Entity,
    Maybe,
    ValidationSource,
    getValidationSource,
} from "../../../../domain/entities/Covid19Info";
import { SetNMROptions } from "../StructuresTable";
import i18n from "../../../../utils/i18n";
import { useAppContext } from "../../../contexts/app-context";

export interface EntitiyCellProps extends CellProps {
    onClickNMR?: OnClickNMR;
    setNMROptions: SetNMROptions;
}

export const EntityCell: React.FC<EntitiyCellProps> = React.memo(props => {
    const { row, onClickDetails, onClickNMR, moreDetails, setNMROptions } = props;
    const { sources: validationSources } = useAppContext();

    const nmrValidationSource = React.useMemo(
        () => getValidationSource(validationSources ?? [], "NMR"),
        [validationSources]
    );

    const entities = React.useMemo(() => {
        return row.entities.map(entity => mapEntity(entity, nmrValidationSource));
    }, [nmrValidationSource, row.entities]);

    return (
        <Wrapper
            onClickDetails={onClickDetails}
            moreDetails={moreDetails}
            row={row}
            field="entities"
        >
            {entities.map((entity, idx) => (
                <>
                    <Link key={idx} tooltip={entity.tooltip} text={entity.name} />
                    {entity.nmr && entity.sourceTooltip && entity.uniprotAcc && (
                        <HtmlTooltip title={entity.sourceTooltip}>
                            <span>
                                <BadgeEntities
                                    moreDetails={moreDetails}
                                    onClick={onClickNMR}
                                    target={{
                                        uniprotId: entity.uniprotAcc,
                                        ...entity.nmr,
                                    }}
                                    setNMROptions={setNMROptions}
                                />
                            </span>
                        </HtmlTooltip>
                    )}
                </>
            ))}
        </Wrapper>
    );
});

function mapEntity(entity: Entity, nmrValidationSource: Maybe<ValidationSource>) {
    const uniprot = entity.uniprotAcc && (
        <div>
            {i18n.t("UniProt")}: {entity.uniprotAcc}
        </div>
    );
    const altNames = entity.altNames && (
        <div>
            {i18n.t("Alt Names")}: {entity.altNames}
        </div>
    );
    const organism = entity.organism && (
        <div>
            {i18n.t("Organism")}: {entity.organism}
        </div>
    );
    const details = entity.details && <div>{entity.details}</div>;
    const antibody = entity.isAntibody && <div>{i18n.t("Entity is antibody")}</div>;
    const nanobody = entity.isNanobody && <div>{i18n.t("Entity is nanobody")}</div>;
    const sybody = entity.isSybody && <div>{i18n.t("Entity is sybody")}</div>;

    const nmr =
        entity.target && entity.start && entity.end
            ? { start: entity.start, end: entity.end, name: entity.target }
            : undefined;

    const tooltip = !_.isEmpty(
        _.compact([uniprot, altNames, organism, details, antibody, nanobody, sybody])
    ) && (
        <React.Fragment>
            {uniprot}
            {altNames}
            {organism}
            {details}
            {antibody}
            {nanobody}
            {sybody}
        </React.Fragment>
    );

    const sourceTooltip = nmrValidationSource && (
        <div>
            {nmrValidationSource.methods.map(method => (
                <>
                    {nmrValidationSource.methods.length > 1 ? (
                        <strong>
                            {i18n.t(`{{methodName}} Method: `, {
                                nsSeparator: false,
                                methodName: method.name,
                            })}
                        </strong>
                    ) : (
                        <strong>{i18n.t("Method: ", { nsSeparator: false })}</strong>
                    )}
                    <span>{method.description}</span>
                    <br />
                    <br />
                </>
            ))}
            {nmrValidationSource.description && (
                <>
                    <strong>{i18n.t("Source: ", { nsSeparator: false })}</strong>
                    <span>{nmrValidationSource.description}</span>
                </>
            )}
        </div>
    );

    return {
        ...entity,
        nmr,
        tooltip,
        sourceTooltip,
    };
}
