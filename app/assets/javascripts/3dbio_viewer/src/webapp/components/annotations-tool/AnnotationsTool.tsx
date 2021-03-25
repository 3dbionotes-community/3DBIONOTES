import React, { useState, useRef } from "react";
import _ from "lodash";
import { Dialog, DialogContent, DialogTitle, IconButton, Switch } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import i18n from "../../utils/i18n";
import { Dropzone, DropzoneRef } from "../dropzone/Dropzone";
import { ProtvistaAction } from "../protvista/Protvista.helpers";
import "./AnnotationsTool.css";

export interface ModelUploadProps {
    title: string;
    onClose(): void;
    action: ProtvistaAction;
}

export const AnnotationsTool: React.FC<ModelUploadProps> = React.memo(props => {
    const { title, onClose, action } = props;

    const annotationFileRef = useRef<DropzoneRef>(null);
    const [error, setError] = useState<string>();
    const [isManual, setIsManual] = useState<boolean>(false);
    const [type, setType] = useState<string>("Region");
    const [description, setDescription] = useState<string>("");
    const [color, setColor] = useState<string>("");
    const [startingValue, setStartingValue] = useState<number>();
    const [endingValue, setEndingValue] = useState<number>();

    const addManualAnnotation = () => {
        setError("");
        if (!startingValue) {
            setError("Missing starting value: please fill in a starting value.");
        }
        if (!endingValue) {
            setEndingValue(startingValue);
        }
    };

    return (
        <Dialog open={true} onClose={onClose} maxWidth="xl" fullWidth>
            <DialogTitle>
                {title}
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {error && <h3>{error}</h3>}
                <label>
                    {isManual
                        ? i18n.t("Add annotation manually")
                        : i18n.t("Annotation file in JSON format")}
                </label>
                <Switch
                    value={isManual}
                    onChange={() => setIsManual(isManual ? false : true)}
                    color="primary"
                />
                {isManual ? (
                    <form>
                        <label htmlFor="trackName">
                            <strong>{i18n.t("Track Name")}</strong>
                        </label>
                        <input
                            aria-label={i18n.t("Track Name")}
                            id="trackName"
                            type="text"
                            value={action.trackId}
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
                            value={type}
                            placeholder="Region"
                            onChange={e => setType(e.target.value)}
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
                            value={description}
                            onChange={e => setDescription(e.target.value)}
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
                            value={color}
                            onChange={e => setColor(e.target.value)}
                            className="form-control"
                        />
                        <label htmlFor="index">
                            <strong>{i18n.t("Index")}</strong>
                        </label>
                        <select className="form-control">
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
                            value={startingValue}
                            onChange={e => setStartingValue(Number(e.target.value))}
                            className="form-control"
                        />
                        <label htmlFor="endingValue">
                            <strong>{i18n.t("Ending value")}</strong>
                        </label>
                        <input
                            aria-label={i18n.t("Ending value")}
                            id="endingValue"
                            type="number"
                            value={endingValue}
                            onChange={e => setEndingValue(Number(e.target.value))}
                            className="form-control"
                        />
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
                        <Dropzone ref={annotationFileRef} accept="application/json"></Dropzone>
                        <button className="submitButton">{i18n.t("Upload")}</button>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
});
