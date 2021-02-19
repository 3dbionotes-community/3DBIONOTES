import React from "react";
import { useHistory } from "react-router-dom";

export function useGoto() {
    const history = useHistory();
    const goTo = React.useCallback(
        (path: string) => {
            history.push(path);
        },
        [history]
    );

    return goTo;
}
