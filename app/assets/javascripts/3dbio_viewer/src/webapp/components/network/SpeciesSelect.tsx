import React from "react";
import i18n from "../../utils/i18n";
import "./Network.css";

export interface SpeciesSelectProps {
    value: string;
    onSpecieChange: (e: string) => void;
}

type NetworkIndex = typeof indexValues[number];

const indexTranslations: Record<NetworkIndex, string> = {
    arabidopsisThaliana: i18n.t("Arabidopsis thaliana"),
    bacillusSubtilis: i18n.t("Bacillus subtilis"),
    bosTaurus: i18n.t("Bos taurus"),
    caenorhabditisElegans: i18n.t("Caenorhabditis elegans"),
    campylobacterJejuni: i18n.t("Campylobacter jejuni"),
    drosophilaMelanogaster: i18n.t("Drosophila melanogaster"),
    escherichiaColi: i18n.t("Escherichia coli"),
    helicobacterPylori: i18n.t("Helicobacter pylori"),
    homoSapiens: i18n.t("Homo sapiens"),
    musMusculus: i18n.t("Mus musculus"),
    mycobacteriumTuberculosis: i18n.t("Mycobacterium tuberculosis"),
    mycoplasmaPneumoniae: i18n.t("Mycoplasma pneumoniae"),
    plasmodiumFalciparum: i18n.t("Plasmodium falciparum"),
    rattusNorvegicus: i18n.t("Rattus norvegicus"),
    saccharomycesCerevisiae: i18n.t("Saccharomyces cerevisiae"),
    schizosaccharomycesPombe: i18n.t("Schizosaccharomyces pombe"),
    synechocystis: i18n.t("Synechocystis sp. (strain PCC 6803 / Kazusa)"),
    treponemaPallidum: i18n.t("Treponema pallidum"),
};

const indexValues = [
    "arabidopsisThaliana",
    "bacillusSubtilis",
    "bosTaurus",
    "caenorhabditisElegans",
    "campylobacterJejuni",
    "drosophilaMelanogaster",
    "escherichiaColi",
    "helicobacterPylori",
    "homoSapiens",
    "musMusculus",
    "mycobacteriumTuberculosis",
    "mycoplasmaPneumoniae",
    "plasmodiumFalciparum",
    "rattusNorvegicus",
    "saccharomycesCerevisiae",
    "schizosaccharomycesPombe",
    "synechocystis",
    "treponemaPallidum",
] as const;

const SpeciesSelect: React.FC<SpeciesSelectProps> = React.memo(props => {
    const { value, onSpecieChange } = props;
    return (
        <select
            className="form-control"
            value={value}
            onChange={e => onSpecieChange(e.target.value)}
        >
            {indexValues.map(value => (
                <option key={value} value={value}>
                    {indexTranslations[value]}
                </option>
            ))}
        </select>
    );
});

export default SpeciesSelect;
