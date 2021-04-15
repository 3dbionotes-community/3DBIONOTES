import React, { useCallback, useState, useRef } from "react";
import _ from "lodash";
import { Dialog, DialogContent, DialogTitle, IconButton, Switch } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import i18n from "../../utils/i18n";
import { useBooleanState } from "../../hooks/use-boolean";
import { Dropzone, DropzoneRef } from "../dropzone/Dropzone";
import { ProtvistaAction } from "../protvista/Protvista.helpers";
import "./AnnotationsTool.css";
import { isElementOfUnion } from "../../../utils/ts-utils";
import { ErrorMessage } from "../error-message/ErrorMessage";

export interface AnnotationsToolProps {
    onClose(): void;
    action: ProtvistaAction;
}

const indexValues = ["sequence", "structure"] as const;
type AnnotationIndex = typeof indexValues[number];

interface AnnotationForm {
    trackName: string;
    type: string;
    description: string;
    color: string;
    index: AnnotationIndex;
    startingValue: number;
    endingValue: number;
}

const indexTranslations: Record<AnnotationIndex, string> = {
    sequence: i18n.t("Sequence"),
    structure: i18n.t("Structure"),
};

export const AnnotationsTool: React.FC<AnnotationsToolProps> = React.memo(props => {
    const { onClose, action } = props;

    const annotationFileRef = useRef<DropzoneRef>(null);
    const [error, setError] = useState<string>();
    const [isManual, { toggle: toggleIsManual }] = useBooleanState(false);
    const [annotationForm, setAnnotationForm] = useState<AnnotationForm>(() =>
        getInitialAnnotationForm(action)
    );

    const addManualAnnotation = useCallback(() => {
        setError("");
        if (!annotationForm.startingValue) {
            setError(i18n.t("Error: Missing starting value - please fill in a starting value."));
        }
        if (!annotationForm.endingValue) {
            setAnnotationForm({ ...annotationForm, endingValue: annotationForm.startingValue });
        }
    }, [annotationForm]);

    const uploadAnnotationFile = useCallback(() => {
        if (annotationFileRef.current?.files.length === 0) {
            setError(
                i18n.t("Error: Missing file - please upload an annotations file in JSON format.")
            );
        } else {
            setError("");
            window.alert("TODO");
        }
    }, []);

    const SwitchToggle = useCallback(() => {
        setError("");
        toggleIsManual();
    }, [toggleIsManual]);

    return (
        <Dialog open={true} onClose={onClose} maxWidth="lg">
            <DialogTitle>
                {i18n.t("Add annotation")}
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <label>
                    {isManual
                        ? i18n.t("Add annotation manually")
                        : i18n.t("Upload annotation file in JSON format (*)")}
                </label>

                <Switch value={isManual} onChange={SwitchToggle} color="primary" />

                {isManual ? (
                    <form className="annotationForm">
                        <label htmlFor="trackName">{i18n.t("Track Name")}</label>
                        <input
                            aria-label={i18n.t("Track Name")}
                            id="trackName"
                            type="text"
                            value={annotationForm.trackName}
                            readOnly
                            className="form-control"
                        />

                        <label htmlFor="type">{i18n.t("Type")}</label>
                        <input
                            aria-label={i18n.t("Type")}
                            id="type"
                            type="text"
                            value={annotationForm.type}
                            placeholder="Region"
                            onChange={e =>
                                setAnnotationForm({ ...annotationForm, type: e.target.value })
                            }
                            className="form-control"
                        />

                        <label htmlFor="description">{i18n.t("Description")}</label>
                        <input
                            aria-label={i18n.t("Description")}
                            id="description"
                            type="text"
                            placeholder="Manually annotated region"
                            value={annotationForm.description}
                            onChange={e =>
                                setAnnotationForm({
                                    ...annotationForm,
                                    description: e.target.value,
                                })
                            }
                            className="form-control"
                        />

                        <label htmlFor="color">{i18n.t("Color")}</label>
                        <small>
                            {i18n.t(
                                "You can put a color name (ie. red) or color hex value (ie. #ffffff)"
                            )}{" "}
                        </small>

                        <input
                            aria-label={i18n.t("Color")}
                            id="color"
                            type="text"
                            value={annotationForm.color}
                            onChange={e =>
                                setAnnotationForm({ ...annotationForm, color: e.target.value })
                            }
                            className="form-control"
                        />

                        <label htmlFor="index">{i18n.t("Index")}</label>
                        <select
                            className="form-control"
                            value={annotationForm.index}
                            onChange={e =>
                                setAnnotationForm({
                                    ...annotationForm,
                                    index: getAnnotationIndexFromEv(e),
                                })
                            }
                        >
                            {indexValues.map(value => (
                                <option key={value} value={value}>
                                    {indexTranslations[value]}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="startingValue">{i18n.t("Starting value (*)")}</label>

                        <input
                            aria-label={i18n.t("Starting value")}
                            id="startingValue"
                            type="number"
                            value={annotationForm.startingValue}
                            onChange={e =>
                                setAnnotationForm({
                                    ...annotationForm,
                                    startingValue: Number(e.target.value),
                                })
                            }
                            className="form-control"
                        />

                        <label htmlFor="endingValue">{i18n.t("Ending value")}</label>
                        <input
                            aria-label={i18n.t("Ending value")}
                            id="endingValue"
                            type="number"
                            value={annotationForm.endingValue}
                            onChange={e =>
                                setAnnotationForm({
                                    ...annotationForm,
                                    endingValue: Number(e.target.value),
                                })
                            }
                            className="form-control"
                        />

                        {error && <ErrorMessage message={error} />}

                        <button
                            className="submitButton"
                            type="submit"
                            onClick={addManualAnnotation}
                        >
                            {i18n.t("Add")}
                        </button>
                    </form>
                ) : (
                    <>
                        <Dropzone
                            ref={annotationFileRef}
                            onDrop={() => setError("")}
                            accept="application/json"
                        ></Dropzone>
                        {error && <ErrorMessage message={error} />}

                        <button
                            className="submitButton"
                            type="submit"
                            onClick={uploadAnnotationFile}
                        >
                            {i18n.t("Upload")}
                        </button>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
});

function getInitialAnnotationForm(action: ProtvistaAction): AnnotationForm {
    return {
        trackName: action.trackId,
        type: "",
        description: "",
        color: "",
        index: "sequence",
        startingValue: 0,
        endingValue: 0,
    };
}

function getAnnotationIndexFromEv(ev: React.ChangeEvent<HTMLSelectElement>): AnnotationIndex {
    const { value } = ev.target;
    return isElementOfUnion(value, indexValues) ? value : indexValues[0];
}
