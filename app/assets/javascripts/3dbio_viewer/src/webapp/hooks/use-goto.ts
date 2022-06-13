import React from "react";
import { useHistory } from "react-router-dom";

export function useGoto() {
    const history = useHistory();
    const goTo = React.useCallback(
        (path: string) => {
            if (location.hash.substring(1) !== path) {
                history.push(path);
            }
        },
        [history]
    );

    return goTo;
}
