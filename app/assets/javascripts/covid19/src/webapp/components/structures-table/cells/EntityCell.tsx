import React from "react";
import _ from "lodash";
import { CellProps } from "../Columns";
import { Link } from "../Link";
import { CenteredTextBox } from "../CenteredTextBox";

export const EntityCell: React.FC<CellProps> = React.memo(props => {
    const { row } = props;

    const entities = React.useMemo(() => {
        return _(row.entities)
            .map(entity => {
                return {
                    id: entity.id,
                    url: entity.externalLink,
                    tooltip: _.compact([entity.name, entity.description]).join("\n"),
                };
            })
            .compact()
            .value();
    }, [row.entities]);

    return (
        <CenteredTextBox>
            {entities.map(entity => (
                <p key={entity.id}>
                    <Link
                        key={entity.id}
                        tooltip={entity.tooltip}
                        url={entity.url}
                        text={entity.id}
                    />
                </p>
            ))}
        </CenteredTextBox>
    );
});
