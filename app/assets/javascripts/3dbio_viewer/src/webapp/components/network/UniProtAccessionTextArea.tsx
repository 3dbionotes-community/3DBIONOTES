import React from "react";
import "./Network.css";

interface UniProtAccessionTextAreaProps {
    value: string;
    onChange: (e: string) => void;
}

const UniProtAccession: React.FC<UniProtAccessionTextAreaProps> = React.memo(props => {
    const { value, onChange } = props;
    return (
        <textarea
            id="uniProtAccession"
            name="uniProtAccession"
            rows={5}
            className="form-control"
            value={value}
            onChange={e => onChange(e.target.value)}
        ></textarea>
    );
});

export default UniProtAccession;
