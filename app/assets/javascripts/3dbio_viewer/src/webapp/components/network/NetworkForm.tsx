import React, { useCallback, useState, useRef } from "react";
import i18n from "../../utils/i18n";
import { Dropzone, DropzoneRef } from "../dropzone/Dropzone";
import IncludeNeighborsCheckbox from "./IncludeNeighborsCheckbox";
import Label from "./Label";
import NetworkExample from "./NetworkExample";
import UniProtAccessionTextArea from "./UniProtAccessionTextArea";
import SpeciesSelect from "./SpeciesSelect";
import "./Network.css";

interface NetworkForm {
    species: string;
    uniProtAccession: string;
    includeNeighboursWithStructuralData: boolean;
}

function getInitialNetworkForm(): NetworkForm {
    return {
        species: "homoSapiens",
        uniProtAccession: "",
        includeNeighboursWithStructuralData: false,
    };
}

const NetworkForm = React.memo(() => {
    const annotationFileRef = useRef<DropzoneRef>(null);
    const [error, setError] = useState<string>();
    const [networkForm, setNetworkForm] = useState<NetworkForm>(() => getInitialNetworkForm());

    const addNetwork = useCallback(() => {
        setError("");
        if (networkForm.uniProtAccession === "") {
            setError("Error: Please write down the UniProt accession");
        }
    }, [networkForm]);

    return (
        <form className="network-form">
            <Label forText="species" labelText="Select species" />
            <SpeciesSelect
                value={networkForm.species}
                onSpecieChange={e =>
                    setNetworkForm({
                        ...networkForm,
                        species: e,
                    })
                }
            />
            <Label forText="uniProtAccession" labelText="Enter a list of UniProt accession" />
            <NetworkExample
                onExampleClick={e =>
                    setNetworkForm({
                        ...networkForm,
                        uniProtAccession: e,
                    })
                }
            />
            <UniProtAccessionTextArea
                textareaValue={networkForm.uniProtAccession}
                onTextareaChange={e => setNetworkForm({ ...networkForm, uniProtAccession: e })}
            />
            <IncludeNeighborsCheckbox
                checkedValue={networkForm.includeNeighboursWithStructuralData}
                onCheckboxChange={() =>
                    setNetworkForm({
                        ...networkForm,
                        includeNeighboursWithStructuralData: !networkForm.includeNeighboursWithStructuralData,
                    })
                }
            />

            <Label forText="uploadAnnotations" labelText="Upload your annotations in JSON format" />
            <Dropzone ref={annotationFileRef} accept="application/json"></Dropzone>
            {error && <h3>{error}</h3>}

            <button className="submit-button" type="submit" onClick={addNetwork}>
                {i18n.t("Submit")}
            </button>
        </form>
    );
});

export default NetworkForm;
