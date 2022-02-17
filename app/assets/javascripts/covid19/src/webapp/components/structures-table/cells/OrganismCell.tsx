import React, { useState, useEffect, useRef } from "react";
import _ from "lodash";
import { CellProps } from "../Columns";
import { Link } from "../Link";
import { rowHeight } from "../StructuresTable";
import styled from "styled-components";
import i18n from "../../../../utils/i18n";
import { BadgeDetails } from "../BadgeDetails";

export const OrganismCell: React.FC<CellProps> = React.memo(props => {
    const { row, onClickDetails, moreDetails } = props;
    const [height, setHeight] = useState(0);
    const ref = useRef<null | HTMLUListElement>(null);

    useEffect(() => {
        setHeight(ref.current?.getBoundingClientRect().height ?? 0);
    }, []);

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

    const Container = styled.div`
        display: flex;
        flex-direction: column;
        ul {
            margin-bottom: 10px;
            max-height: ${rowHeight - 62}px;
            overflow-x: hidden;
            overflow-y: hidden;
        }
        div {
            text-align: center;
        }
        p {
            overflow-wrap: anywhere;
        }
    `;

    return (
        <Container>
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
            {height >= rowHeight - 62 && moreDetails !== false && (
                <BadgeDetails onClick={onClickDetails} row={row} field="organisms" />
            )}
        </Container>
    );
});
