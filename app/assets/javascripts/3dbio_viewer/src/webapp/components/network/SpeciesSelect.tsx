import React from "react";
import _ from "lodash";
import { speciesRecord } from "../../../domain/entities/Species";
import "./Network.css";
import { useCallbackFromEventValue } from "../../hooks/use-callback-event-value";

export interface SpeciesSelectProps {
    value: string;
    onSpeciesChange: (newValue: string) => void;
}

const SpeciesSelect: React.FC<SpeciesSelectProps> = React.memo(props => {
    const { value, onSpeciesChange } = props;

    const options = _(speciesRecord)
        .toPairs()
        .map(([value, text]) => ({ value, text }))
        .value();

    const setSpecies = useCallbackFromEventValue(onSpeciesChange);

    return (
        <select className="form-control-viewer" value={value} onChange={setSpecies}>
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.text}
                </option>
            ))}
        </select>
    );
});

export default SpeciesSelect;
