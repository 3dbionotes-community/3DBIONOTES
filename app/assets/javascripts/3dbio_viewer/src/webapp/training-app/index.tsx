import { SnackbarProvider } from "d2-ui-components";
import React, { useCallback } from "react";
import { ActionButton } from "./components/action-button/ActionButton";
import { TrainingWizard } from "./components/training-wizard/TrainingWizard";
import {
    TrainingContextProvider,
    TrainingContextProviderProps,
    useTrainingContext,
} from "./contexts/training-context";

export const TrainingApp: React.FC<TrainingContextProviderProps> = React.memo(props => {
    return (
        <SnackbarProvider>
            <TrainingContextProvider {...props}>
                <MainComponent />
            </TrainingContextProvider>
        </SnackbarProvider>
    );
});

const MainComponent: React.FC = React.memo(() => {
    const { appState, setAppState, module } = useTrainingContext();

    const exitTutorial = useCallback(() => {
        setAppState(appState => ({ ...appState, minimized: true }));
    }, [setAppState]);

    if (appState.minimized) {
        return (
            <ActionButton
                onClick={() => setAppState(appState => ({ ...appState, minimized: false }))}
            />
        );
    } else if (appState.type !== "TRAINING") return null;

    return (
        <>
            <ActionButton
                onClick={() => setAppState(appState => ({ ...appState, minimized: true }))}
            />
            <TrainingWizard onClose={exitTutorial} module={module} />
        </>
    );
});
