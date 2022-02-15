import React, { useCallback, useState, useRef } from "react";
import _ from "lodash";
import {
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Switch,
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import i18n from "../../utils/i18n";
import { useBooleanState } from "../../hooks/use-boolean";
import { Dropzone, DropzoneRef } from "../dropzone/Dropzone";
import "./AnnotationsTool.css";
import { isElementOfUnion } from "../../../utils/ts-utils";
import { ErrorMessage } from "../error-message/ErrorMessage";
import {
    AnnotationIndex,
    indexValues,
    Annotations,
    AnnotationWithTrack,
    getAnnotationsFromAnnotationFromTrack,
} from "../../../domain/entities/Annotation";
import { useAppContext } from "../AppContext";
import { useCallbackEffect } from "../../hooks/use-callback-effect";

export interface AnnotationsToolProps {
    onClose(): void;
    onAdd(annotations: Annotations): void;
}

const indexTranslations: Record<AnnotationIndex, string> = {
    sequence: i18n.t("Sequence"),
    structure: i18n.t("Structure"),
};

export const AnnotationsTool: React.FC<AnnotationsToolProps> = React.memo(props => {
    const { onClose, onAdd } = props;
    const { compositionRoot } = useAppContext();

    const annotationFileRef = useRef<DropzoneRef>(null);
    const [error, setError] = useState<string>();
    const [isManual, { toggle: toggleIsManual }] = useBooleanState(false);
    const [annotationForm, setAnnotationForm] = useState<AnnotationWithTrack>(
        getInitialAnnotationForm
    );

    const openAnnotations = React.useCallback(
        (annotations: Annotations) => {
            onAdd(annotations);
            onClose();
        },
        [onAdd, onClose]
    );

    const addManualAnnotation = useCallback(() => {
        if (!annotationForm.start) {
            setError(i18n.t("Missing starting value - please fill in a starting value."));
        } else if (!annotationForm.end) {
            setAnnotationForm({ ...annotationForm, end: annotationForm.start });
        } else {
            const annotations = getAnnotationsFromAnnotationFromTrack(annotationForm);
            openAnnotations(annotations);
        }
    }, [annotationForm, openAnnotations]);

    const [isLoading, loadingActions] = useBooleanState();

    const uploadAnnotationFile = useCallbackEffect(
        useCallback(() => {
            const file = annotationFileRef.current?.files[0];

            if (!file) {
                const msg = i18n.t("File missing - please use an annotations file in JSON format");
                setError(msg);
            } else {
                loadingActions.open();
                return compositionRoot.getAnnotations.execute(file).run(openAnnotations, err => {
                    loadingActions.close();
                    setError(err.message);
                });
            }
        }, [compositionRoot, openAnnotations, loadingActions])
    );

    const switchToggle = useCallback(() => {
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

                <Switch value={isManual} onChange={switchToggle} color="primary" />

                {isManual ? (
                    <Form isDisabled={isLoading}>
                        <label htmlFor="trackName">{i18n.t("Track Name")}</label>
                        <input
                            aria-label={i18n.t("Track Name")}
                            id="trackName"
                            type="text"
                            value={annotationForm.trackName}
                            onChange={e =>
                                setAnnotationForm({ ...annotationForm, trackName: e.target.value })
                            }
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

                        <label htmlFor="start">{i18n.t("Starting value (*)")}</label>

                        <input
                            aria-label={i18n.t("Starting value")}
                            id="start"
                            type="number"
                            value={annotationForm.start}
                            onChange={e =>
                                setAnnotationForm({
                                    ...annotationForm,
                                    start: Number(e.target.value),
                                })
                            }
                            className="form-control"
                        />

                        <label htmlFor="end">{i18n.t("Ending value")}</label>
                        <input
                            aria-label={i18n.t("Ending value")}
                            id="end"
                            type="number"
                            value={annotationForm.end}
                            onChange={e =>
                                setAnnotationForm({
                                    ...annotationForm,
                                    end: Number(e.target.value),
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
                    </Form>
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
                            disabled={isLoading}
                        >
                            {i18n.t("Upload")}
                        </button>

                        {isLoading && <CircularProgress style={{ marginLeft: 20 }} size={20} />}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
});

const Form: React.FC<{ isDisabled: boolean }> = props => {
    const { isDisabled, children } = props;
    return (
        <form className="annotationForm">
            <fieldset style={{ border: "none" }} disabled={isDisabled}>
                {children}
            </fieldset>
        </form>
    );
};

function getInitialAnnotationForm(): AnnotationWithTrack {
    return {
        trackName: "",
        type: "",
        description: "",
        color: "",
        index: "sequence",
        start: 0,
        end: 0,
    };
}

function getAnnotationIndexFromEv(ev: React.ChangeEvent<HTMLSelectElement>): AnnotationIndex {
    const { value } = ev.target;
    return isElementOfUnion(value, indexValues) ? value : indexValues[0];
}
