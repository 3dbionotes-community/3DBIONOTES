import React from "react";
// @ts-ignore
// import ProtvistaTrack from "protvista-track";
// @ts-ignore
// import ProtvistaTrackWrapper from "protvista-tracker";
// @ts-ignore
// import DataLoader from "data-loader";
// @ts-ignore
// import ProtvistaFeatureAdapter from "protvista-feature-adapter";

export const ProtVistaTrack: React.FC = () => {
    return (
        <React.Fragment>
            {/*
            <protvista-track length="770" displaystart="1" displayend="770" tooltip-event="click">
                <protvista-feature-adapter id="adapter1">
                    <data-loader>
                        <source src="https://www.ebi.ac.uk/proteins/api/features/P05067?categories=PTM" />
                    </data-loader>
                </protvista-feature-adapter>
            </protvista-track>
            */}
            <div>
                <protvista-pdb accession="P05067"></protvista-pdb>
                <xprotvista-pdb accession="P0DTC1"></xprotvista-pdb>
            </div>
        </React.Fragment>
    );
    //return <ProtvistaTrackWrapper />;
};
