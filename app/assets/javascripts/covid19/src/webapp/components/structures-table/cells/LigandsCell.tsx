import _ from "lodash";
import React from "react";
import styled from "styled-components";
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
    const [ligandsIDR, setLigandsIDR] = React.useState<{ inChI: string; idr: LigandImageData }[]>(
        []
    );

    const ligands = React.useMemo(() => {
        return row.ligands.map(ligand => {
            return {
                ...ligand,
                url: ligand.externalLink,
                tooltip: !_.isEmpty(
                    _.compact(_.values(_.pick(ligand, ["id", "name", "details", "imageLink"])))
                ) && (
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
        compositionRoot.ligands.getIDR
            .execute(row.ligands.flatMap(({ inChI, hasIDR }) => (hasIDR ? [inChI] : [])))
            .run(
                arr => {
                    const idrs = arr.filter(inChIAndIDR => inChIAndIDR.idr) as {
                        inChI: string;
                        idr: LigandImageData;
                    }[];
                    if (!_.isEmpty(idrs)) setLigandsIDR(idrs);
                },
                err => {
                    throw new Error(err.message);
                }
            );
    }, [row.ligands, compositionRoot]);

    return (
        <Wrapper
            onClickDetails={onClickDetails}
            moreDetails={moreDetails}
            row={row}
            field="ligands"
        >
            {ligands
                .sort((a, b) => (b.hasIDR ? (a.hasIDR ? 0 : 1) : -1))
                .map(ligand => {
                    const idr = ligandsIDR.find(({ inChI }) => inChI === ligand.inChI)?.idr;
                    return (
                        <LigandItem key={ligand.id} moreDetails={moreDetails}>
                            <Link
                                tooltip={ligand.tooltip}
                                url={ligand.url}
                                text={`${ligand.name} (${ligand.id})`}
                            >
                                {ligand.hasIDR && idr && (
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
