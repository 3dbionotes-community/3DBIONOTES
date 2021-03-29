import React from "react";
import "./Network.css";

interface UniProtAccessionTextAreaProps {
    textareaValue: string;
    onTextareaChange: (e: string) => void;
}

const UniProtAccession: React.FC<UniProtAccessionTextAreaProps> = React.memo(props => {
    const { textareaValue, onTextareaChange } = props;
    return (
        <textarea
            id="uniProtAccession"
            name="uniProtAccession"
            rows={5}
            className="form-control"
            value={textareaValue}
            onChange={e => onTextareaChange(e.target.value)}
        ></textarea>
    );
});

export default UniProtAccession;
