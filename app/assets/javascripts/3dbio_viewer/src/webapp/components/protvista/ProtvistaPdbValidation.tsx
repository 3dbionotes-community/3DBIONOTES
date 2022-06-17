import React from "react";
import { ProtvistaPdb, ProtvistaPdbProps } from "./ProtvistaPdb";

export const ProtvistaPdbValidation: React.FC<ProtvistaPdbProps> = React.memo(props => {
    console.log("tracks", props.pdb.tracks);

    return (
        <>
            <h2>This is the custom ProtvistaPdbValidation component</h2>
            <ProtvistaPdb {...props} />
        </>
    );
});
