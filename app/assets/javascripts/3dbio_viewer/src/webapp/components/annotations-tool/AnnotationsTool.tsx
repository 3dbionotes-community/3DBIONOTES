import _ from "lodash";
import React, { useCallback, useState, useRef } from "react";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import ToggleButton from "@material-ui/lab/ToggleButton";
import { Box, CircularProgress, Dialog, DialogContent } from "@material-ui/core";
import { Description as DescriptionIcon, Edit as EditIcon } from "@material-ui/icons";
import {
    AnnotationIndex,
    indexValues,
    Annotations,
    AnnotationWithTrack,
} from "../../../domain/entities/Annotation";
import { useBooleanState } from "../../hooks/use-boolean";
import { Dropzone, DropzoneRef } from "../dropzone/Dropzone";
import { isElementOfUnion, recordOfStyles } from "../../../utils/ts-utils";
import { ErrorMessage } from "../error-message/ErrorMessage";
import { useAppContext } from "../AppContext";
import { useCallbackEffect } from "../../hooks/use-callback-effect";
import { TooltipTypography } from "../HtmlTooltip";
import { DialogTitleHelp } from "../DialogTitleHelp";
import { StyledButton } from "../../training-app/components/action-button/ActionButton";
import i18n from "../../utils/i18n";
import "./AnnotationsTool.css";

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
    const [isManual, setIsManual] = useState(false);
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

    const downloadExample = React.useCallback<React.MouseEventHandler<HTMLAnchorElement>>(
        ev => {
            ev.stopPropagation();
            ev.preventDefault();
            compositionRoot.downloadAnnotationsExample.execute();
        },
        [compositionRoot]
    );

    const handleManualToggle = React.useCallback(
        (_event: React.MouseEvent<HTMLElement>, isManual: boolean) => {
            setError("");
            setIsManual(isManual);
        },
        [setError, setIsManual]
    );

    return (
        <Dialog open={true} onClose={onClose} maxWidth="xs">
            <DialogTitleHelp
                title={i18n.t("Add annotation")}
                onClose={onClose}
                tooltip={
                    <TooltipTypography variant="body2">
                        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Pariatur eaque
                        aspernatur, adipisci harum dolor neque dicta voluptas a asperiores sequi
                        atque quibusdam cumque. At excepturi nobis ea, tempora omnis eum
                    </TooltipTypography>
                }
            />
            <DialogContent>
                <Box marginBottom={2} fontWeight="fontWeightBold">
                    <span>
                        {i18n.t(
                            "Upload your custom annotations manually or by file in JSON format "
                        )}
                        <a href="#" onClick={downloadExample}>
                            {i18n.t("example")}
                        </a>
                        {":"}
                    </span>
                </Box>
                <Box>
                    <ToggleButtonGroup
                        value={isManual}
                        exclusive
                        onChange={handleManualToggle}
                        aria-label={i18n.t("add custom annotations options")}
                    >
                        <ToggleButton value={false} aria-label={i18n.t("add by file")}>
                            <DescriptionIcon />
                            <Box display="inline" marginLeft={1}>
                                {i18n.t("Add by file")}
                            </Box>
                        </ToggleButton>
                        <ToggleButton value={true} aria-label={i18n.t("add manually")}>
                            <EditIcon />
                            <Box display="inline" marginLeft={1}>
                                {i18n.t("Add manually")}
                            </Box>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

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
                    <Box marginTop={4}>
                        <Dropzone
                            ref={annotationFileRef}
                            onDrop={() => setError("")}
                            accept="application/json"
                        ></Dropzone>
                        {error && <ErrorMessage message={error} />}

                        <div style={dialogStyles.actionButtons}>
                            <StyledButton
                                className="submitButton"
                                type="submit"
                                onClick={uploadAnnotationFile}
                                disabled={isLoading}
                                style={dialogStyles.submitButton}
                            >
                                {i18n.t("Submit")}
                            </StyledButton>
                        </div>

                        {isLoading && <CircularProgress style={{ marginLeft: 20 }} size={20} />}
                    </Box>
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

const dialogStyles = recordOfStyles({
    actionButtons: {
        textAlign: "right",
    },
    submitButton: {
        marginTop: "1.5em",
        marginBottom: 0,
        fontSize: "1em",
    },
});

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

function getAnnotationsFromAnnotationFromTrack(annotation: AnnotationWithTrack): Annotations {
    const tracks = [
        {
            trackName: annotation.trackName,
            annotations: [
                {
                    type: annotation.type,
                    start: annotation.start,
                    end: annotation.end,
                    color: annotation.color,
                    description: annotation.description,
                },
            ],
        },
    ];
    return { tracks, data: JSON.stringify(annotation) };
}
