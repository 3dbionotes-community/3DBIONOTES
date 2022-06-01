import React from "react";
import i18n from "../../../../utils/i18n";
import { CellProps } from "../Columns";
import { Link } from "../Link";
import { Wrapper } from "./Wrapper";

export const EntityCell: React.FC<CellProps> = React.memo(props => {
    const { row, onClickDetails, moreDetails } = props;

    const entities = React.useMemo(() => {
        return row.entities.map(entity => {
            return {
                name: entity.name,
                tooltip: (
                    <React.Fragment>
                        {entity.uniprotAcc && (
                            <div>
                                {i18n.t("UniProt")}: {entity.uniprotAcc}
                            </div>
                        )}

                        {entity.altNames && (
                            <div>
                                {i18n.t("Alt Names")}: {entity.altNames}
                            </div>
                        )}

                        {entity.organism && (
                            <div>
                                {i18n.t("Organism")}: {entity.organism}
                            </div>
                        )}

                        {entity.details && <div>{entity.details}</div>}
                        {entity.isAntibody && <div>{i18n.t("Entity is antibody")}</div>}
                        {entity.isNanobody && <div>{i18n.t("Entity is nanobody")}</div>}
                        {entity.isSybody && <div>{i18n.t("Entity is sybody")}</div>}
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
