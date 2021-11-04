import React from "react";
import _ from "lodash";
import { CellProps } from "../Columns";
import { Link } from "../Link";
import i18n from "../../../../utils/i18n";

export const OrganismCell: React.FC<CellProps> = React.memo(props => {
    const { row } = props;

    const organisms = React.useMemo(() => {
        return _(row.organisms)
            .map(organism => ({
                id: organism.id,
                url: organism.externalLink,
                tooltip: (
                    <React.Fragment>
                        <div>
                            {i18n.t("ID")}: {organism.id}
                        </div>

                        <div>
                            {i18n.t("Scientific name")}: {organism.name}
                        </div>

                        {organism.commonName && (
                            <div>
                                {i18n.t("Common name")}: {organism.commonName}
                            </div>
                        )}
                    </React.Fragment>
                ),
                name: organism.name,
            }))
            .compact()
            .value();
    }, [row.organisms]);

    return (
        <ul>
            {organisms.map(entity => (
                <Link
                    key={entity.id}
                    tooltip={entity.tooltip}
                    url={entity.url}
                    text={entity.name}
                />
            ))}
        </ul>
    );
});
