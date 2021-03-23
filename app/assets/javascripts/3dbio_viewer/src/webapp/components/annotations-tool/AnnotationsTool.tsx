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
//import { ProtvistaPdbProps } from "../protvista/ProtvistaPdb";
import "./AnnotationsTool.css";

export interface ModelUploadProps {
    title: string;
    onClose(): void;
    action: string;
}

export const AnnotationsTool: React.FC<ModelUploadProps> = React.memo(props => {
    const { title, onClose, action } = props;

    const annotationFileRef = useRef<DropzoneRef>(null);
    const [error, setError] = useState<string>();

    return (
        <Dialog open={true} onClose={onClose} maxWidth="xl" fullWidth className="model-upload">
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
                <Dropzone ref={annotationFileRef} accept=".pdb,.cif"></Dropzone>
                <button className="uploadSubmit">
                    Upload
                </button>
               <h3>OR ADD YOUR ANNOTATIONS MANUALLY</h3>
               <form>
                   <table id="input_labels">
                       <tbody>
                           <tr>
                               <td>TRACK NAME</td>
                               <td>
                                   <input type="text" id="input_track_name" placeholder={action}></input>
                               </td>
                           </tr>
                           <tr>
                               <td>TYPE</td>
                               <td>
                                   <input type="text" id="input_type" value="region"></input>
                               </td>
                           </tr>
                           <tr>
                               <td>DESCRIPTION</td>
                               <td>
                                   <input type="text" id="input_description" value="Manually annotated region"></input>
                               </td>
                           </tr>
                           <tr>
                               <td>COLOR</td>
                               <td>
                                   <input type="text" id="input_color"></input>
                               </td>
                           </tr>
                       </tbody>    
                   </table>
                   <table id="input_coordinates">
                        <tbody>
                            <tr>
                                <td>INDEX</td>
                                <td>
                                    <select id="input_index">
                                        <option value="sequence">SEQUENCE</option>
                                        <option value="structure">STRUCTURE</option>
                                    </select>
                                </td>
                                <td>BEGIN</td>
                                <td>
                                    <input className="short" type="text" id="input_begin"></input>
                                </td>
                                <td>END</td>
                                <td>
                                    <input className="short" type="text" id="input_end"></input>
                                </td>
                            </tr>
                        </tbody>
                   </table>
                   <button id="add_annotation" type="button">ADD</button>
               </form>
            </DialogContent>
        </Dialog>
    );
});
