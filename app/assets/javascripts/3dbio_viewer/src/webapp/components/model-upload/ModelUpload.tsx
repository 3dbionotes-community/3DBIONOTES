import React, { useCallback, useState, useRef } from "react";
import _ from "lodash";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import i18n from "../../utils/i18n";
import { Dropzone, DropzoneRef, getFile } from "../dropzone/Dropzone";
import { useCallbackEffect } from "../../hooks/use-callback-effect";
import { AtomicStructure } from "../../../domain/entities/AtomicStructure";
import { useAppContext } from "../AppContext";
import { useBooleanState } from "../../hooks/use-boolean";
import { LoaderMask } from "../loader-mask/LoaderMask";
import { StructureMappingUpload } from "./StructureMappingUpload";
import { ErrorMessage } from "../error-message/ErrorMessage";
import { StyledButton } from "../../training-app/components/action-button/ActionButton";
import { recordOfStyles } from "../../../utils/ts-utils";
import { AllowedExtension, getAllowedFileExtension } from "../../view-models/Selection";
import { Anchor } from "../Anchor";

export interface ModelUploadProps {
    title: string;
    onClose(): void;
    onLoaded(options: { token: string }): void;
}

export const ModelUpload: React.FC<ModelUploadProps> = React.memo(props => {
    const { title, onClose, onLoaded } = props;
    const [open, setOpen] = useState<boolean>(false);
    const { compositionRoot } = useAppContext();
    const [
        isUploadConfirmationOpen,
        { enable: openUploadConfirmation, disable: closeUploadConfirmation },
    ] = useBooleanState(false);

    const [jobTitle, setJobTitle] = useState<string>("");
    const [error, setError] = useState<string>();
    const [atomicStructure, setAtomicStructure] = useState<AtomicStructure>();
    const [fileExtension, setFileExtension] = useState<AllowedExtension>("cif");
    const structureFileRef = useRef<DropzoneRef>(null);
    const annotationFileRef = useRef<DropzoneRef>(null);

    const submitCb = useCallback(() => {
        setError("");
        const structureFile = getFile(structureFileRef);

        if (structureFile) {
            setFileExtension(getAllowedFileExtension(structureFile.name));
            const uploadParams = {
                jobTitle,
                structureFile,
                annotationsFile: getFile(annotationFileRef),
            };
            setOpen(true);
            return compositionRoot.uploadAtomicStructure.execute(uploadParams).run(
                result => {
                    setAtomicStructure(result);
                    setOpen(false);
                    openUploadConfirmation();
                },
                error => {
                    setOpen(false);
                    setError(error.message);
                }
            );
        } else {
            setError(i18n.t("Error: Missing file - please select a structure file."));
            return _.noop;
        }
    }, [compositionRoot, jobTitle, openUploadConfirmation]);

    const submit = useCallbackEffect(submitCb);

    const downloadExample = React.useCallback<React.MouseEventHandler<HTMLAnchorElement>>(
        ev => {
            ev.stopPropagation();
            ev.preventDefault();
            return compositionRoot.downloadAnnotationsExample.execute();
        },
        [compositionRoot]
    );

    return (
        <>
            <Dialog open={true} onClose={onClose} maxWidth="md">
                <DialogTitle>
                    {title}
                    <IconButton onClick={onClose}>
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <p>
                        {i18n.t(
                            "Models under study and not deposited to PDB yet can be analysed too. Annotations from similar entries based on BLAST sequence match will be displayed, but also customised annotations can be provided by the user. Job title (if provided) will be used to identify the model, otherwise the file name will be used."
                        )}
                    </p>

                    <label htmlFor="jobTitle">{i18n.t("Job Title")}</label>
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
                        <Anchor href="http://www.wwpdb.org/documentation/file-format"> PDB </Anchor>
                        {i18n.t("or")}
                        <Anchor href="http://mmcif.wwpdb.org/"> mmCIF </Anchor>{" "}
                        {i18n.t("format (*)")}
                    </label>
                    <Dropzone
                        ref={structureFileRef}
                        onDrop={() => setError("")}
                        accept=".pdb,.cif,.ent"
                    ></Dropzone>

                    <label className="fileFormat">
                        <span>
                            {i18n.t("Upload your annotations file in JSON format")} (
                            <a href="#" onClick={downloadExample}>
                                {i18n.t("example")}
                            </a>
                            )
                        </span>
                    </label>
                    <Dropzone
                        ref={annotationFileRef}
                        onDrop={() => setError("")}
                        accept={"application/json"}
                    ></Dropzone>

                    {error && <ErrorMessage message={error} />}

                    <div style={dialogStyles.actionButtons}>
                        <StyledButton
                            className="uploadSubmit"
                            type="submit"
                            onClick={submit}
                            style={dialogStyles.submitButton}
                        >
                            {i18n.t("Submit")}
                        </StyledButton>
                    </div>

                    {open && (
                        <LoaderMask open={open} title={i18n.t("Uploading Atomic Structure...")} />
                    )}
                </DialogContent>
            </Dialog>

            {isUploadConfirmationOpen && atomicStructure ? (
                <StructureMappingUpload
                    atomicStructure={atomicStructure}
                    jobTitle={jobTitle}
                    onClose={closeUploadConfirmation}
                    onLoaded={onLoaded}
                    fileExtension={fileExtension}
                />
            ) : null}
        </>
    );
});

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
