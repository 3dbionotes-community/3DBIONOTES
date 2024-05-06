import React from "react";
import { SnackbarProvider } from "@eyeseetea/d2-ui-components/snackbar";
import { getCompositionRoot } from "../../../compositionRoot";
import { Covid19Info } from "../../../domain/entities/Covid19Info";
import { AppContext, AppContextState } from "../../contexts/app-context";
import { Root } from "./Root";
import "./App.css";

declare global {
    interface Window {
        app: { data: Covid19Info };
    }
}

const compositionRoot = getCompositionRoot();

export const App = React.memo(() => {
    const [appContext, setAppContext] = React.useState<AppContextState>({
        compositionRoot,
        sources: [],
    });

    React.useEffect(() => {
        compositionRoot.getSources
            .execute()
            .run(sources => setAppContext({ compositionRoot, sources }), console.error);
    }, []);

    return (
        <AppContext.Provider value={appContext}>
            <SnackbarProvider>
                <Root />
            </SnackbarProvider>
        </AppContext.Provider>
    );
});
