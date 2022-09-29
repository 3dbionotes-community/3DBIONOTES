import React from "react";
import styled from "styled-components";
import { Maybe } from "../../../../data/utils/ts-utils";
import { LigandImageData } from "../../../../domain/entities/LigandImageData";
import i18n from "../../../../utils/i18n";
import { useAppContext } from "../../../contexts/app-context";
import { BadgeLigands } from "../badge/BadgeLigands";
import { CellProps, styles } from "../Columns";
import { Link } from "../Link";
import { Wrapper } from "./Wrapper";

export const LigandsCell: React.FC<CellProps> = React.memo(props => {
    const { row, onClickDetails, onClickIDR, moreDetails } = props;
    const { compositionRoot } = useAppContext();
    const [ligandsIDR, setLigandsIDR] = React.useState<Record<string, Maybe<LigandImageData>>>({});

    const ligands = React.useMemo(() => {
        return row.ligands.map(ligand => {
            return {
                ...ligand,
                url: ligand.externalLink,
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

    React.useEffect(() => {
        row.ligands.forEach(ligand =>
            compositionRoot.ligands.getIDR.execute(ligand.id).run(
                imageDataResource => {
                    if (imageDataResource)
                        setLigandsIDR(ligandsIDR => ({
                            ...ligandsIDR,
                            [ligand.id]: imageDataResource,
                        }));
                },
                err => console.error(err.message)
            )
        );
    }, [row.ligands, compositionRoot]);

    return (
        <Wrapper
            onClickDetails={onClickDetails}
            moreDetails={moreDetails}
            row={row}
            field="ligands"
        >
            {ligands.map(ligand => {
                const idr = ligandsIDR[ligand.id];
                return (
                    <LigandItem key={ligand.id} moreDetails={moreDetails}>
                        <Link
                            tooltip={ligand.tooltip}
                            url={ligand.url}
                            text={`${ligand.name} (${ligand.id})`}
                        >
                            {idr && (
                                <BadgeLigands
                                    ligand={ligand}
                                    onClick={onClickIDR}
                                    moreDetails={moreDetails}
                                    imageDataResource={idr}
                                />
                            )}
                        </Link>
                    </LigandItem>
                );
            })}
        </Wrapper>
    );
});

const LigandItem = styled.div<{ moreDetails?: boolean }>`
    li {
        text-align: left;
    }
    p {
        margin-top: 0;
        text-align: left;
        display: ${props => (props.moreDetails ? "inherit" : "inline-flex")};
        margin-right: ${props => (props.moreDetails ? "0" : "0.5em")};
    }
`;
