import React from "react";
import { CompositionRoot, getCompositionRoot } from "../../compositionRoot";
import { Source } from "../../domain/entities/Source";

type AppContextState = {
    compositionRoot: CompositionRoot;
    sources: Source[];
};

const compositionRoot = getCompositionRoot();

export const AppReactContext = React.createContext<AppContextState>({
    compositionRoot,
    sources: [],
});

export function useAppContext(): AppContextState {
    return React.useContext(AppReactContext);
}

export const AppContext: React.FC = React.memo(props => {
    const [appContext, setAppContext] = React.useState<AppContextState>({
        compositionRoot,
        sources: [],
    });

    React.useEffect(() => {
        compositionRoot.getSources
            .execute()
            .run(sources => setAppContext({ compositionRoot, sources }), console.error);
    }, []);

    React.useEffect(() => {
        window.app = appContext;
    }, [appContext]);

    return <AppReactContext.Provider value={appContext}>{props.children}</AppReactContext.Provider>;
});

declare global {
    interface Window {
        app: AppContextState;
    }
}
