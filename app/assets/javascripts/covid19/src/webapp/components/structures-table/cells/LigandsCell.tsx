import React, { useState, useEffect, useRef } from "react";
import i18n from "../../../../utils/i18n";
import { CellProps, styles } from "../Columns";
import { Link } from "../Link";
import { rowHeight } from "../StructuresTable";
import styled from "styled-components";
import { BadgeDetails } from "../BadgeDetails";

export const LigandsCell: React.FC<CellProps> = React.memo(props => {
    const { row, onClickDetails, moreDetails } = props;
    const [height, setHeight] = useState(0);
    const ref = useRef<null | HTMLUListElement>(null);

    useEffect(() => {
        setHeight(ref.current?.getBoundingClientRect().height ?? 0);
    }, []);

    const ligands = React.useMemo(() => {
        return row.ligands.map(ligand => {
            return {
                id: ligand.id,
                url: ligand.externalLink,
                name: ligand.name,
                tooltip: (
                    <React.Fragment>
                        <div>
                            {i18n.t("ID")}: {ligand.id}
                        </div>
                        <div>
                            {i18n.t("Name")}: {ligand.name}
                        </div>

                        {ligand.details !== ligand.name && (
                            <div>
                                {i18n.t("Details")}: {ligand.details}
                            </div>
                        )}

                        {ligand.imageLink && (
                            <img alt={ligand.id} src={ligand.imageLink} style={styles.image} />
                        )}
                    </React.Fragment>
                ),
            };
        });
    }, [row.ligands]);

    const Container = styled.div`
        display: flex;
        flex-direction: column;
        ul {
            margin: 10px 0;
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
            <ul ref={ref}>
                {ligands.map(ligand => (
                    <Link
                        key={ligand.id}
                        tooltip={ligand.tooltip}
                        url={ligand.url}
                        text={`${ligand.name} (${ligand.id})`}
                    />
                ))}
            </ul>
            {height >= rowHeight - 62 && moreDetails !== false && (
                <BadgeDetails onClick={onClickDetails} row={row} field="ligands" />
            )}
        </Container>
    );
});
