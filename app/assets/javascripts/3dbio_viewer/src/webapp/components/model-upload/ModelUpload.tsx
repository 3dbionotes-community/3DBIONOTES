import React , { useCallback, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import _ from "lodash";
import { FileRejection } from "react-dropzone";
import i18n from "../../utils/i18n";
import "./ModelUpload.css";
import { Dropzone, DropzoneRef } from "../dropzone/Dropzone";
export interface ModelUploadProps {
    title: string;
    onClose(): void;
    //onSelect(actionType: ActionType, selected: DbItem): void;
}


export const ModelUpload: React.FC<ModelUploadProps> = React.memo(props => {
    const { title, onClose } = props;
    const fileRef = useRef<DropzoneRef>(null);
    const handleFileUpload = useCallback(
        async (files: File[], rejections: FileRejection[]) => {
            if (files.length === 0 && rejections.length > 0) {
                return;
            }
            return true;
            //@ts-ignore TODO FIXME: Add validation
        },
        []
    );

    return (
        <Dialog open={true} onClose={onClose} maxWidth="xl" fullWidth className="model-upload">
            <DialogTitle>
                {title}
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <p>Models under study and not deposited to PDB yet can be analysed too. Annotations from similar entries based on BLAST sequence match will be displayed, but also customised annotations can be provided by the user. Job title (if provided) will be used to identify the model, otherwise the file name will be used.</p>
                <div className="uploadParams">
                    <div className="jobTitle">
                        <input
                            aria-label={i18n.t("Job Title")}
                            placeholder="Job Title"
                            type="text"
                        />
                    </div>
                    <Dropzone
                ref={fileRef}
                accept={"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
                onDrop={handleFileUpload}
            >
                
            </Dropzone>
                </div>
            </DialogContent>
        </Dialog>
    );
});
