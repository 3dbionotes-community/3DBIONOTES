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
                name: entity.name,
                tooltip: (
                    <React.Fragment>
                        {entity.uniprotAcc && (
                            <div>
                                {i18n.t("UniProt")}: {entity.uniprotAcc}
                            </div>
                        )}

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
            ${moreDetails !== false ? "margin: 10px 0;" : "margin:0;"}
            ${moreDetails !== false &&
            "max-height: " + (rowHeight - 62) + "px; overflow-y: hidden; overflow-x: hidden;"}
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
            <ul ref={ref}>
                {entities.map((entity, idx) => (
                    <Link key={idx} tooltip={entity.tooltip} text={entity.name} />
                ))}
            </ul>
            {height >= rowHeight - 62 && moreDetails !== false && (
                <BadgeDetails onClick={onClickDetails} row={row} field="entities" />
            )}
        </Container>
    );
});
