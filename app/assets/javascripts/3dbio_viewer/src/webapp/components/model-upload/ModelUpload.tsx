import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import _ from "lodash";
import i18n from "../../utils/i18n";
import { Dropzone, DropzoneRef, getFile } from "../dropzone/Dropzone";
import { useAppContext } from "../AppContext";
import "./ModelUpload.css";

export interface ModelUploadProps {
    title: string;
    onClose(): void;
}


export const ModelUpload: React.FC<ModelUploadProps> = React.memo(props => {
    const { title, onClose } = props;
    const { compositionRoot } = useAppContext();

    const [jobTitle, setJobTitle] = useState<string>("");
    const structureFileRef = useRef<DropzoneRef>(null);
    const annotationFileRef = useRef<DropzoneRef>(null);
    const [error, setError] = useState<string>();

    const onSubmitHandler = () => {
        setError("");
        const structureFile = getFile(structureFileRef);

        if (structureFile) {
            const uploadParams = {
                jobTitle,
                structureFile,
                annotationsFile: getFile(annotationFileRef),
            };
            return compositionRoot.uploadAtomicStructure(uploadParams);
        } else {
            setError("Error: No file selected. Please select a structure file.");
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
                <p>
                    Models under study and not deposited to PDB yet can be analysed too. Annotations
                    from similar entries based on BLAST sequence match will be displayed, but also
                    customised annotations can be provided by the user. Job title (if provided) will
                    be used to identify the model, otherwise the file name will be used.
                </p>

                <label htmlFor="jobTitle">
                    <strong>Job Title</strong>
                </label>
                <small>Optional</small>
                <input
                    aria-label={i18n.t("Job Title")}
                    value={jobTitle}
                    placeholder="Job Title"
                    onChange={e => setJobTitle(e.target.value)}
                    id="jobTitle"
                    type="text"
                    className="form-control"
                />

                <label className="fileFormat">
                    Structure file in{" "}
                    <a href="http://www.wwpdb.org/documentation/file-format">PDB</a> or{" "}
                    <a href="http://mmcif.wwpdb.org/">mmCIF</a> format
                </label>
                <Dropzone ref={structureFileRef} accept=".pdb,.cif"></Dropzone>

                <label className="fileFormat">Upload your annotations</label>
                <Dropzone ref={annotationFileRef} accept={"application/json"}></Dropzone>

                <button className="uploadSubmit" onClick={onSubmitHandler}>
                    Submit
                </button>
            </DialogContent>
        </Dialog>
    );
});
