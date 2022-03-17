import React from "react";
import { sendAnalytics } from "../../../utils/analytics";

export interface StateSetters {
    setSearch: (value: string) => void;
    setTitle: (value: React.ReactNode) => void;
    setProteomeSelected: (value: boolean) => void;
    setLoading: (value: boolean) => void;
}

interface ProteomePathProps {
    name: string;
    classStyle: string;
    def: string;
    stateSetters: StateSetters;
}

export const ProteomePath: React.FC<ProteomePathProps> = React.memo(props => {
    const {
        name,
        classStyle,
        def,
        stateSetters: { setTitle, setSearch, setProteomeSelected, setLoading },
    } = props;

    return (
        <path
            className={classStyle}
            d={def}
            onMouseEnter={() => setTitle(<span>{name}</span>)}
            onClick={() => {
                setLoading(true);
                setSearch(name);
                setProteomeSelected(true);
                sendAnalytics({
                    type: "event",
                    category: "proteome",
                    action: "select",
                    label: name,
                });
                setTimeout(() => {
                    setLoading(false);
                }, 700);
            }}
        />
    );
});
