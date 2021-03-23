import React, { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import _ from "lodash";
import { Dropzone, DropzoneRef } from "../dropzone/Dropzone";
import { ProtvistaAction } from "../protvista/Protvista.helpers";
import "./AnnotationsTool.css";
import i18n from "../../utils/i18n";

export interface ModelUploadProps {
    title: string;
    onClose(): void;
    action: ProtvistaAction;
}

export const AnnotationsTool: React.FC<ModelUploadProps> = React.memo(props => {
    const { title, onClose, action } = props;

    const annotationFileRef = useRef<DropzoneRef>(null);
    const [error, setError] = useState<string>();
    const [type, setType] = useState<string>("Region");
    const [description, setDescription] = useState<string>("");
    const [color, setColor] = useState<string>("");
    const [startingValue, setStartingValue] = useState<number>();
    const [endingValue, setEndingValue] = useState<number>();
    const [showManualAnnotation, setShowManualAnnotation] = useState<boolean>(false);

    const addManualAnnotation = () => {
        setError("");
        if(!startingValue) {
            setError("Missing starting value: please fill in a starting value.");
            return;
        }
        if(!endingValue) {
            setEndingValue(startingValue);
        }
    }

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
                <label className="fileFormat">
                    Annotation file in{" "}
                    <a href="http://3dbionotes.cnb.csic.es/upload_annotations.txt">JSON</a> format
                </label>
                <Dropzone ref={annotationFileRef} accept="application/json"></Dropzone>
                <button className="uploadSubmit">
                    Upload
                </button>
                <h3>OR</h3>
               <button onClick={() => setShowManualAnnotation(!showManualAnnotation)} className="uploadSubmit">Add your annotations manually</button>
               { showManualAnnotation && 
               <form>
               <label htmlFor="trackName">
                    <strong>Track Name</strong>
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
                    <strong>Type</strong>
                </label>
                <input
                    aria-label={i18n.t("Type")}
                    id="type"
                    type="text"
                    value={type} 
                    placeholder="Region"
                    onChange={(e) => setType(e.target.value)}
                    className="form-control"
                />
                <label htmlFor="description">
                    <strong>Description</strong>
                </label>
                <input
                    aria-label={i18n.t("Description")}
                    id="description"
                    type="text"
                    placeholder="Manually annotated region"
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-control"
                />
                <label htmlFor="color">
                    <strong>Color</strong>
                </label>
                <small>You can put a color name (ie. red) or color hex value (ie. #ffffff)</small>
                <input
                    aria-label={i18n.t("Color")}
                    id="color"
                    type="text"
                    value={color} 
                    onChange={(e) => setColor(e.target.value)}
                    className="form-control"
                />
                <label htmlFor="index">
                    <strong>Index</strong>
                </label>
                <select className="form-control">
                <option value="sequence">Sequence</option>
                <option value="structure">Structure</option>
            </select>
            <label htmlFor="startingValue">
                    <strong>Starting value</strong>
                </label>
                <input
                    aria-label={i18n.t("Starting value")}
                    id="startingValue"
                    type="text"
                    value={startingValue} 
                    onChange={(e) => setStartingValue(Number(e.target.value))}
                    className="form-control"
                />
            <label htmlFor="endingValue">
                    <strong>Ending value</strong>
                </label>
                <input
                    aria-label={i18n.t("Ending value")}
                    id="endingValue"
                    type="text"
                    value={endingValue} 
                    onChange={(e) => setEndingValue(Number(e.target.value))}
                    className="form-control"
                />
                <button className="uploadSubmit" type="submit" onClick={addManualAnnotation}>Add</button>
               </form>
}
            </DialogContent>
        </Dialog>
    );
});
