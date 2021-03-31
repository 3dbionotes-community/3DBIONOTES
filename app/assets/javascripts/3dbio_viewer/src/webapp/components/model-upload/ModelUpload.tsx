import React, { useCallback, useState, useRef } from "react";
import _ from "lodash";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import i18n from "../../utils/i18n";
import { Dropzone, DropzoneRef, getFile } from "../dropzone/Dropzone";
import { useCallbackEffect } from "../../hooks/use-callback-effect";
import { UploadData } from "../../../domain/entities/UploadData";
import { useAppContext } from "../AppContext";
import { useBooleanState } from "../../hooks/use-boolean";
import { UploadConfirmation } from "./UploadConfirmation";

export interface ModelUploadProps {
    title: string;
    onClose(): void;
}

export const ModelUpload: React.FC<ModelUploadProps> = React.memo(props => {
    const { title, onClose } = props;
    const { compositionRoot } = useAppContext();
    const [
        isUploadConfirmationOpen,
        { enable: openUploadConfirmation, disable: closeUploadConfirmation },
    ] = useBooleanState(false);

    const [jobTitle, setJobTitle] = useState<string>("");
    const [error, setError] = useState<string>();
    const [uploadData, setUploadData] = useState<UploadData>();
    const structureFileRef = useRef<DropzoneRef>(null);
    const annotationFileRef = useRef<DropzoneRef>(null);

    const submitCb = useCallback(() => {
        setError("");
        const structureFile = getFile(structureFileRef);
        if (structureFile) {
            const uploadParams = {
                jobTitle,
                structureFile,
                annotationsFile: getFile(annotationFileRef),
            };
            return compositionRoot.uploadAtomicStructure(uploadParams).run(result => {
                setUploadData(result);
                openUploadConfirmation();
            }, console.error);
        } else {
            setError(i18n.t("Error: No file selected. Please select a structure file."));
            return _.noop;
        }
    }, [compositionRoot, jobTitle, openUploadConfirmation]);

    const submit = useCallbackEffect(submitCb);
    return (
        <>
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
                        {i18n.t(
                            "Models under study and not deposited to PDB yet can be analysed too. Annotations from similar entries based on BLAST sequence match will be displayed, but also customised annotations can be provided by the user. Job title (if provided) will be used to identify the model, otherwise the file name will be used."
                        )}
                    </p>

                    <label htmlFor="jobTitle">
                        <strong>{i18n.t("Job Title")}</strong>
                    </label>
                    <small>{i18n.t("Optional")}</small>
                    <input
                        aria-label={i18n.t("Job Title")}
                        value={jobTitle}
                        placeholder={i18n.t("Job Title")}
                        onChange={e => setJobTitle(e.target.value)}
                        id="jobTitle"
                        type="text"
                        className="form-control"
                    />

                    <label className="fileFormat">
                        {i18n.t("Structure file in")}
                        <a href="http://www.wwpdb.org/documentation/file-format"> PDB </a>
                        {i18n.t("or")}
                        <a href="http://mmcif.wwpdb.org/"> mmCIF </a> {i18n.t("format")}
                    </label>
                    <Dropzone ref={structureFileRef} accept=".pdb,.cif"></Dropzone>

                    <label className="fileFormat">{i18n.t("Upload your annotations")}</label>
                    <Dropzone ref={annotationFileRef} accept={"application/json"}></Dropzone>

                    <button className="uploadSubmit" onClick={submit}>
                        {i18n.t("Submit")}
                    </button>
                </DialogContent>
            </Dialog>
            {isUploadConfirmationOpen && uploadData ? (
                <UploadConfirmation uploadData={uploadData} onClose={closeUploadConfirmation} />
            ) : null}
        </>
    );
});
