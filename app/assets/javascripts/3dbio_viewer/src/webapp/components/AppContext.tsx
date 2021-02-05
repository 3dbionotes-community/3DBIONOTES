import React from "react";
import { getCompositionRoot } from "../../compositionRoot";

const appContextValue = {
    compositionRoot: getCompositionRoot(),
};

type AppContextValue = typeof appContextValue;

const AppReactContext = React.createContext(appContextValue);

export function useAppContext(): AppContextValue {
    return React.useContext(AppReactContext);
}

export const AppContext: React.FC = React.memo(props => {
    return (
        <AppReactContext.Provider value={appContextValue}>
            {props.children}
        </AppReactContext.Provider>
    );
});

declare global {
    interface Window {
        app: AppContextValue;
    }
}

window.app = appContextValue;
