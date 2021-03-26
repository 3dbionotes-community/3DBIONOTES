import React, { useCallback, useState, useRef } from "react";
import _ from "lodash";
import { Dialog, DialogContent, DialogTitle, IconButton, Switch } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import i18n from "../../utils/i18n";
import { useBooleanState } from "../../hooks/use-boolean";
import { Dropzone, DropzoneRef } from "../dropzone/Dropzone";
import { ProtvistaAction } from "../protvista/Protvista.helpers";
import "./AnnotationsTool.css";

export interface AnnotationsToolProps {
    onClose(): void;
    action: ProtvistaAction;
}

interface AnnotationForm {
    trackName: string;
    type: string;
    description: string;
    color: string;
    index: string;
    startingValue: number;
    endingValue: number;
}

export const AnnotationsTool: React.FC<AnnotationsToolProps> = React.memo(props => {
    const { onClose, action } = props;

    const annotationFileRef = useRef<DropzoneRef>(null);
    const [error, setError] = useState<string>();
    const [isManual, { toggle: toggleIsManual }] = useBooleanState(false);
    const [annotationForm, setAnnotationForm] = useState<AnnotationForm>({
        trackName: action.trackId,
        type: "",
        description: "",
        color: "",
        index: "sequence",
        startingValue: 0,
        endingValue: 0,
    });

    const addManualAnnotation = useCallback(() => {
        setError("");
        if (!annotationForm.startingValue) {
            setError("Missing starting value: please fill in a starting value.");
        }
        if (!annotationForm.endingValue) {
            setAnnotationForm({ ...annotationForm, endingValue: annotationForm.startingValue });
        }
    }, [annotationForm]);

    const uploadAnnotationFile = useCallback(() => {
        setError("");
        if (annotationFileRef && annotationFileRef.current?.files.length === 0) {
            setError("Missing file: please upload an annotations file in JSON format.");
        }
    }, []);

    return (
        <Dialog open={true} onClose={onClose} maxWidth="xl" fullWidth>
            <DialogTitle>
                {i18n.t("Add Annotation")}
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <label>
                    {isManual
                        ? i18n.t("Add annotation manually")
                        : i18n.t("Upload annotation file in JSON format")}
                </label>
                <Switch value={isManual} onChange={() => toggleIsManual()} color="primary" />
                {isManual ? (
                    <form className="annotationForm">
                        <label htmlFor="trackName">
                            <strong>{i18n.t("Track Name")}</strong>
                        </label>
                        <input
                            aria-label={i18n.t("Track Name")}
                            id="trackName"
                            type="text"
                            value={annotationForm.trackName}
                            readOnly
                            className="form-control"
                        />
                        <label htmlFor="type">
                            <strong>{i18n.t("Type")}</strong>
                        </label>
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
                        <label htmlFor="description">
                            <strong>{i18n.t("Description")}</strong>
                        </label>
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
                        <label htmlFor="color">
                            <strong>{i18n.t("Color")}</strong>
                        </label>
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
                        <label htmlFor="index">
                            <strong>{i18n.t("Index")}</strong>
                        </label>
                        <select
                            className="form-control"
                            value={annotationForm.index}
                            onChange={e =>
                                setAnnotationForm({ ...annotationForm, index: e.target.value })
                            }
                        >
                            <option value="sequence">{i18n.t("Sequence")}</option>
                            <option value="structure">{i18n.t("Structure")}</option>
                        </select>
                        <label htmlFor="startingValue">
                            <strong>{i18n.t("Starting value")}</strong>
                        </label>
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
                        <label htmlFor="endingValue">
                            <strong>{i18n.t("Ending value")}</strong>
                        </label>
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
                        {error && <h3>{error}</h3>}
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
                        {error && <h3>{error}</h3>}
                        <Dropzone ref={annotationFileRef} accept="application/json"></Dropzone>
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
