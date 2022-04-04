import React from "react";
import { sendAnalytics } from "../../../utils/analytics";

interface ProteomePathProps {
    name: string;
    classStyle: string;
    def: string;
    details?: Details;
    stateSetters: StateSetters;
}

export const ProteomePath: React.FC<ProteomePathProps> = React.memo(props => {
    const {
        name,
        classStyle,
        def,
        details,
        stateSetters: { setTitle, setSearch, setProteomeSelected, setDetails, toggleProteome },
    } = props;

    const triggerSearch = React.useCallback(() => {
        setSearch(name);
        setProteomeSelected(true);
        toggleProteome();
        sendAnalytics({
            type: "event",
            category: "proteome",
            action: "select",
            label: name,
        });
    }, [name, setProteomeSelected, setSearch, toggleProteome]);

    const showProteinInfo = React.useCallback(() => {
        setTitle(<span>{name}</span>);
        setDetails(details);
    }, [name, details, setTitle, setDetails]);

    return (
        <path
            className={classStyle}
            d={def}
            onMouseEnter={showProteinInfo}
            onClick={triggerSearch}
        />
    );
});

interface PDB {
    id: string;
    img: string;
}

interface EMDB extends PDB {}

export interface Details {
    description: string;
    pdb: PDB;
    emdb?: EMDB;
}

export interface StateSetters {
    setSearch: (value: string) => void;
    setTitle: (value: React.ReactNode) => void;
    setProteomeSelected: (value: boolean) => void;
    setDetails: (value: Details | undefined) => void;
    toggleProteome: () => void;
}
