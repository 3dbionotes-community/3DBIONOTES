import { Button } from "@material-ui/core";
import React from "react";
import testCovid19Data from "../../../data/covid19.json";

interface Covid19Data {
    proteins: unknown[];
}

interface AppProps {
    data?: Covid19Data;
}

export const App: React.FC<AppProps> = props => {
    const data: Covid19Data = props.data || testCovid19Data;

    return (
        <div>
            <div>App component: {data.proteins.length} proteins</div>

            <Button variant="contained" color="primary">
                Does nothing
            </Button>
        </div>
    );
};
