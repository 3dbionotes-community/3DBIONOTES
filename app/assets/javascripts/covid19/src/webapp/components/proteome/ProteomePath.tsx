import React from "react";
import { sendAnalytics } from "../../../utils/analytics";

interface ProteomePathProps {
    name: string;
    classStyle: string;
    def: string;
    details?: ProtDetails;
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
        setTitle(name);
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

export interface DB {
    id: string;
    img: string;
}

export interface ProtDetails {
    gen?: string;
    synonyms?: string;
    domain?: string;
    description?: string;
    pdb?: DB;
    emdb?: DB;
    childrenPDB?: string[];
}

export interface StateSetters {
    setSearch: (value: string) => void;
    setTitle: (value: string) => void;
    setProteomeSelected: (value: boolean) => void;
    setDetails: (value: ProtDetails | undefined) => void;
    toggleProteome: () => void;
}
