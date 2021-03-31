import React from "react";
import "./Network.css";

export interface SpeciesSelectProps {
    value: string;
    onSpeciesChange: (newValue: string) => void;
}

const speciesList = [
    "Arabidopsis thaliana",
    "Bacillus subtilis",
    "Bos taurus",
    "Caenorhabditis elegans",
    "Campylobacter jejuni",
    "Drosophila melanogaster",
    "Escherichia coli",
    "Helicobacter pylori",
    "Homo sapiens",
    "Mus musculus",
    "Mycobacterium tuberculosis",
    "Mycoplasma pneumoniae",
    "Plasmodium falciparum",
    "Rattus norvegicus",
    "Saccharomyces cerevisiae",
    "Schizosaccharomyces pombe",
    "Synechocystis sp. (strain PCC 6803 / Kazusa)",
    "Treponema pallidum",
];

const SpeciesSelect: React.FC<SpeciesSelectProps> = React.memo(props => {
    const { value, onSpeciesChange } = props;
    return (
        <select
            className="form-control"
            value={value}
            onChange={ev => onSpeciesChange(ev.target.value)}
        >
            {speciesList.map(species => (
                <option key={species} value={species}>
                    {species}
                </option>
            ))}
        </select>
    );
});

export default SpeciesSelect;
