import React from "react";
import i18n from "../../../../utils/i18n";
import { CellProps } from "../Columns";
import { Link } from "../Link";

export const EntityCell: React.FC<CellProps> = React.memo(props => {
    const { row } = props;

    const entities = React.useMemo(() => {
        return row.entities.map(entity => {
            return {
                id: entity.id,
                name: entity.name,
                tooltip: (
                    <React.Fragment>
                        <div>
                            {i18n.t("ID")}: {entity.uniprotAcc}
                        </div>

                        {entity.altNames.length !== 0 && (
                            <div>
                                {i18n.t("Alt Names")}: {entity.altNames}
                            </div>
                        )}

                        {entity.organism.length !== 0 && (
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
        <ul>
            {entities.map(entity => (
                <Link key={entity.id} tooltip={entity.tooltip} text={entity.name} />
            ))}
        </ul>
    );
});
