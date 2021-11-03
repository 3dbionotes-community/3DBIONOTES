import React from "react";
import _ from "lodash";
import { CellProps } from "../Columns";
import { Link } from "../Link";
import { CenteredTextBox } from "../CenteredTextBox";

export const OrganismCell: React.FC<CellProps> = React.memo(props => {
    const { row } = props;

    const organisms = React.useMemo(() => {
        return _(row.organisms)
            .map((organism, index) => ({
                id: organism.id,
                url: organism.externalLink,
                tooltip: organism.name,
                name: `${organism.name}${index !== row.organisms.length - 1 ? " / " : ""}`,
            }))
            .compact()
            .value();
    }, [row.organisms]);

    return (
        <CenteredTextBox>
            {organisms.map(entity => (
                <Link
                    key={entity.id}
                    tooltip={entity.tooltip}
                    url={entity.url}
                    text={entity.name}
                />
            ))}
        </CenteredTextBox>
    );
});
