import React, { useState, useEffect, useRef } from "react";
import i18n from "../../../../utils/i18n";
import { CellProps } from "../Columns";
import { Link } from "../Link";
import { rowHeight } from "../StructuresTable";
import styled from "styled-components";
import { BadgeDetails } from "../BadgeDetails";

export const EntityCell: React.FC<CellProps> = React.memo(props => {
    const { row, onClickDetails, moreDetails } = props;
    const [height, setHeight] = useState(0);
    const ref = useRef<null | HTMLUListElement>(null);

    useEffect(() => {
        setHeight(ref.current?.getBoundingClientRect().height ?? 0);
    }, []);

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
                {entities.map(entity => (
                    <Link key={entity.id} tooltip={entity.tooltip} text={entity.name} />
                ))}
            </ul>
            {height >= rowHeight - 62 && moreDetails !== false && (
                <BadgeDetails onClick={onClickDetails} row={row} field="entities" />
            )}
        </Container>
    );
});
