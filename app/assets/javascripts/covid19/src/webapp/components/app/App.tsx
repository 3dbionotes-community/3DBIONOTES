import { Button } from "@material-ui/core";
import React from "react";

export const App: React.FC = () => {
    return (
        <div>
            <div>App component</div>

            <Button variant="contained" color="primary">
                Does nothing
            </Button>
        </div>
    );
};
