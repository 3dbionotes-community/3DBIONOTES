import React, { useContext } from "react";
import { CompositionRoot } from "../../compositionRoot";
import { Source } from "../../domain/entities/Source";

export interface AppContextState {
    compositionRoot: CompositionRoot;
    sources: Source[];
}

export const AppContext = React.createContext<AppContextState | null>(null);

export function useAppContext() {
    const context = useContext(AppContext);
    if (context) {
        return context;
    } else {
        throw new Error("App context uninitialized");
    }
}
