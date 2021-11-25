import React from "react";
import { Badge } from "./Badge";
import { Button } from "@material-ui/core";

interface SearchExampleButtonProps {
    exampleValue: string;
    setValue: (exampleValue: string) => void;
}

export const SearchExampleButton: React.FC<SearchExampleButtonProps> = React.memo(props => {
    const { exampleValue, setValue } = props;

    return (
        <Button onClick={() => setValue(exampleValue)} style={badgeStyles.button}>
            <Badge style={badgeStyles.badge}>{exampleValue}</Badge>
        </Button>
    );
});

const badgeStyles = {
    badge: {
        backgroundColor: "#607d8b",
        borderColor: "#607d8b",
        marginRight: 5,
    },
    button: {
        padding: "3px 3px",
    },
};
