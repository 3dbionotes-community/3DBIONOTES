import React, { useImperativeHandle } from "react";
import { DropzoneOptions, DropzoneRootProps, useDropzone } from "react-dropzone";
import styled from "styled-components";
import i18n from "../../utils/i18n";

export interface DropzoneRef {
    openDialog: () => void;
    files: File[];
}

export const Dropzone = React.forwardRef(
    (props: DropzoneOptions, ref: React.ForwardedRef<DropzoneRef>) => {
        const { getRootProps, getInputProps, acceptedFiles, open } = useDropzone({
            noClick: true,
            maxFiles: 1,
            ...props,
        });

        const files = acceptedFiles.map(file => file.name);

        useImperativeHandle(ref, () => ({
            openDialog() {
                open();
            },
            files: acceptedFiles,
        }));
        return (
            <div {...getRootProps()} style={{ outline: "none" }}>
                <div>
                    <Shade onClick={open}>
                        <input {...getInputProps()} />
                        <Text>
                            {acceptedFiles.length !== 0
                                ? files
                                : i18n.t("Drag and drop some files here, or click to select files")}
                        </Text>
                    </Shade>
                </div>
            </div>
        );
    }
);

export function getFile(fileRef: React.RefObject<DropzoneRef>): File | undefined {
    return fileRef.current?.files[0];
}

const getColor = (props: DropzoneRootProps) => {
    if (props.isDragAccept) {
        return "#00e676";
    }
    if (props.isDragReject) {
        return "#ff1744";
    }
    if (props.isDragActive) {
        return "#2196f3";
    }
    return "#eeeeee";
};

const Shade = styled.div<DropzoneRootProps>`
    display: flex;
    place-content: center;
    text-shadow: 1px 1px 10px black;
    padding: 60px;
    align-items: center;
    border-width: 2px;
    border-radius: 2px;
    border-color: ${props => getColor(props)};
    border-style: dashed;
    background-color: #fafafa;
    outline: none;
    transition: border 0.24s ease-in-out;
    height: 10px;
    background-color: rgba(10, 10, 10, 0.5);
    cursor: pointer;
`;

const Text = styled.p`
    text-align: center;
    font-size: 18px;
    color: white;
`;
