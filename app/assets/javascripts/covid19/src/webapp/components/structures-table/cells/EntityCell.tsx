import _ from "lodash";
import React from "react";
import i18n from "../../../../utils/i18n";
import { CellProps } from "../Columns";
import { Link } from "../Link";
import { Wrapper } from "./Wrapper";

export const EntityCell: React.FC<CellProps> = React.memo(props => {
    const { row, onClickDetails, moreDetails } = props;

    const entities = React.useMemo(() => {
        return row.entities.map(entity => {
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

            return {
                name: entity.name,
                tooltip: !_.isEmpty(
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
                ),
            };
        });
    }, [row.entities]);

    return (
        <Wrapper
            onClickDetails={onClickDetails}
            moreDetails={moreDetails}
            row={row}
            field="entities"
        >
            {entities.map((entity, idx) => (
                <Link key={idx} tooltip={entity.tooltip} text={entity.name} />
            ))}
        </Wrapper>
    );
});
