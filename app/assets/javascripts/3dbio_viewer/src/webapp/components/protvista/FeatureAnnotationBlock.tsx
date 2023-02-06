import _ from "lodash";
import React from "react";
import { Pdb } from "../../../domain/entities/Pdb";

interface BasicInfoProps {
    pdb: Pdb;
}

export const FeatureAnnotationBlock: React.FC<BasicInfoProps> = React.memo(({ pdb }) => {
    return <div></div>;
});
