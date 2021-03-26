import React, { useCallback, useState, useRef } from "react";
import _ from "lodash";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import i18n from "../../utils/i18n";
import { Dropzone, DropzoneRef } from "../dropzone/Dropzone";
import "./Network.css";

export interface NetworkProps {
    onClose(): void;
}

interface NetworkForm {
    species: string;
    uniProtAccession: string;
    includeNeighboursWithStructuralData: boolean;
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

function getInitialNetworkForm(): NetworkForm {
    return {
        species: "homoSapiens",
        uniProtAccession: "",
        includeNeighboursWithStructuralData: false,
    };
}

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

export const Network: React.FC<NetworkProps> = React.memo(props => {
    const { onClose } = props;

    const annotationFileRef = useRef<DropzoneRef>(null);
    const [error, setError] = useState<string>();
    const [networkForm, setNetworkForm] = useState<NetworkForm>(() => getInitialNetworkForm());

    const addNetwork = useCallback(() => {
        setError("");
        if (networkForm.uniProtAccession === "") {
            setError("Error: Please write down the UniProt accession");
        } else if (annotationFileRef.current?.files.length === 0) {
            setError("Error: Please upload the annotation file in JSON format");
        }
    }, [networkForm]);

    return (
        <Dialog open={true} onClose={onClose} maxWidth="xl" fullWidth>
            <DialogTitle>
                {i18n.t("Network")}
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <label>
                    {i18n.t(
                        "In order to calculate Protein-protein interaction networks, please select the species and provide a list of protein identifiers."
                    )}
                </label>

                <form className="network-form">
                    <label htmlFor="species">
                        <strong>{i18n.t("Select species")}</strong>
                    </label>
                    <select
                        className="form-control"
                        value={networkForm.species}
                        onChange={e =>
                            setNetworkForm({
                                ...networkForm,
                                species: e.target.value,
                            })
                        }
                    >
                        {indexValues.map(value => (
                            <option key={value} value={value}>
                                {indexTranslations[value]}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="uniProtAccession">
                        <strong>{i18n.t("Enter a list of UniProt accession")}</strong>
                    </label>
                    <span
                        id="network-example"
                        onClick={() =>
                            setNetworkForm({
                                ...networkForm,
                                uniProtAccession: "P01111 \nP01112 \nP01116",
                            })
                        }
                    >
                        <small>Example</small>
                    </span>
                    <textarea
                        id="uniProtAccession"
                        name="uniProtAccession"
                        rows={5}
                        className="form-control"
                        value={networkForm.uniProtAccession}
                        onChange={e =>
                            setNetworkForm({ ...networkForm, uniProtAccession: e.target.value })
                        }
                    ></textarea>

                    <div className="form-check">
                        <input
                            type="checkbox"
                            checked={networkForm.includeNeighboursWithStructuralData}
                            onChange={() =>
                                setNetworkForm({
                                    ...networkForm,
                                    includeNeighboursWithStructuralData: !networkForm.includeNeighboursWithStructuralData,
                                })
                            }
                        />
                        <label>Include neighbours with structural data</label>
                    </div>

                    <label htmlFor="form-control">
                        <strong>{i18n.t("Upload your annotations in JSON format")}</strong>
                    </label>
                    <Dropzone ref={annotationFileRef} accept="application/json"></Dropzone>
                    {error && <h3>{error}</h3>}

                    <button className="submit-button" onClick={addNetwork}>
                        {i18n.t("Submit")}
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
});
