import React from "react";
import { Pdb } from "../../../domain/entities/Pdb";
import { recordOfStyles } from "../../../utils/ts-utils";
import { Selection } from "../../view-models/Selection";
import { BlockDef } from "../protvista/Protvista.types";
import i18n from "../../utils/i18n";

interface BasicInfoProps {
    pdb: Pdb;
}

export const IDRViewerBlock: React.FC<BasicInfoProps> = React.memo(props => {
    const { pdb } = props;

    return <div>{pdb.ligands.imageDataResource}</div>;
});

const styles = recordOfStyles({
    ul: { listStyleType: "none" },
    help: { marginLeft: 10 },
});
