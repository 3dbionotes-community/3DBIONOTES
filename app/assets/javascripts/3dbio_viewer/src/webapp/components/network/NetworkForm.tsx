import React, { useCallback, useState, useRef } from "react";
import i18n from "../../utils/i18n";
import { Dropzone, DropzoneRef } from "../dropzone/Dropzone";
import IncludeNeighborsCheckbox from "./IncludeNeighborsCheckbox";
import Label from "./Label";
import NetworkExample from "./NetworkExample";
import UniProtAccessionTextArea from "./UniProtAccessionTextArea";
import SpeciesSelect from "./SpeciesSelect";
import "./Network.css";
import { ErrorMessage } from "../error-message/ErrorMessage";
import { sendAnalytics } from "../../utils/analytics";
import { useAppContext } from "../AppContext";
import { useCallbackEffect } from "../../hooks/use-callback-effect";
import { speciesList } from "../../../domain/entities/Species";
import { isElementOfUnion } from "../../../utils/ts-utils";
import {
    BuildProgress,
    BuildNetworkResult,
    NetworkDefinition,
} from "../../../domain/repositories/NetworkRepository";
import { LinearProgressWithLabel } from "../ProgressBarWithValue";

interface NetworkForm {
    species: string;
    uniProtAccession: string;
    includeNeighboursWithStructuralData: boolean;
}

const initialNetworkForm: NetworkForm = {
    species: "human",
    uniProtAccession: "",
    includeNeighboursWithStructuralData: false,
};

type State = { type: "fill-data" } | { type: "uploading"; progressValue: number };

export interface NetworkFormProps {
    onData(data: BuildNetworkResult): void;
}

const NetworkForm: React.FC<NetworkFormProps> = React.memo(props => {
    const { onData } = props;
    const { compositionRoot } = useAppContext();
    const annotationFileRef = useRef<DropzoneRef>(null);
    const [error, setError] = useState<string>();
    const [networkForm, setNetworkForm] = useState(initialNetworkForm);
    const [state, setState] = React.useState<State>({ type: "fill-data" });

    const onProgress = React.useCallback((progress: BuildProgress) => {
        const { currentStep, totalSteps, value } = progress;
        const newValue =
            currentStep < 1 ? 0 : 100 * ((currentStep - 1) / totalSteps) + value / totalSteps;
        setState({ type: "uploading", progressValue: newValue });
    }, []);

    const addNetwork = useCallbackEffect(
        useCallback(() => {
            if (!networkForm.uniProtAccession) {
                setError(i18n.t("Error: Missing UniProt accession"));
                return () => {};
            } else if (!isElementOfUnion(networkForm.species, speciesList)) {
                setError(i18n.t("Error: Invalid species"));
            } else {
                setError("");

                const annotationsFile = annotationFileRef.current?.files[0];

                const network: NetworkDefinition = {
                    species: networkForm.species,
                    proteins: networkForm.uniProtAccession,
                    includeNeighboursWithStructuralData:
                        networkForm.includeNeighboursWithStructuralData,
                    annotationsFile,
                };

                sendAnalytics("upload", { type: "network", on: "viewer" });

                return compositionRoot.buildNetwork
                    .execute({ network, onProgress })
                    .run(onData, err => {
                        setError(err.message);
                        setState({ type: "fill-data" });
                    });
            }
        }, [networkForm, compositionRoot, onData, onProgress])
    );

    return (
        <div className="network-form">
            <Label forText={i18n.t("species")} label={i18n.t("Select species (*)")} />
            <SpeciesSelect
                value={networkForm.species}
                onSpeciesChange={newSpecies =>
                    setNetworkForm({ ...networkForm, species: newSpecies })
                }
            />
            <Label
                forText={i18n.t("uniProtAccession")}
                label={i18n.t("Enter a list of UniProt accession (*)")}
            />
            <NetworkExample
                onExampleClick={e => {
                    setNetworkForm({ ...networkForm, uniProtAccession: e });
                    setError("");
                }}
            />
            <UniProtAccessionTextArea
                value={networkForm.uniProtAccession}
                onChange={e => {
                    setNetworkForm({ ...networkForm, uniProtAccession: e });
                    setError("");
                }}
            />
            <IncludeNeighborsCheckbox
                checked={networkForm.includeNeighboursWithStructuralData}
                onChange={() =>
                    setNetworkForm({
                        ...networkForm,
                        includeNeighboursWithStructuralData: !networkForm.includeNeighboursWithStructuralData,
                    })
                }
            />

            <Label
                forText={i18n.t("uploadAnnotations")}
                label={i18n.t("Upload your annotations in JSON format")}
            />

            <Dropzone ref={annotationFileRef} accept="application/json"></Dropzone>

            {error && <ErrorMessage message={error} />}

            {state.type === "uploading" && <LinearProgressWithLabel value={state.progressValue} />}

            <button
                className="submit-button"
                type="submit"
                onClick={addNetwork}
                disabled={state.type === "uploading"}
            >
                {i18n.t("Submit")}
            </button>
        </div>
    );
});

export default NetworkForm;
