import React from "react";
import { getCompositionRoot } from "../../compositionRoot";

const appContextValue = {
    compositionRoot: getCompositionRoot(),
};

const AppReactContext = React.createContext(appContextValue);

export function useAppContext(): typeof appContextValue {
    return React.useContext(AppReactContext);
}

export const AppContext: React.FC = React.memo(props => {
    return (
        <AppReactContext.Provider value={appContextValue}>
            {props.children}
        </AppReactContext.Provider>
    );
});

Object.assign(window as any, { app: appContextValue });
