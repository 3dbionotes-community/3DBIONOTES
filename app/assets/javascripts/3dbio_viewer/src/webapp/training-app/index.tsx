import { SnackbarProvider } from "d2-ui-components";
import React, { useCallback } from "react";
import { ActionButton } from "./components/action-button/ActionButton";
import { TrainingWizard } from "./components/training-wizard/TrainingWizard";
import {
    TrainingContextProvider,
    TrainingContextProviderProps,
    useTrainingContext,
} from "./contexts/training-context";

export const TrainingApp: React.FC<TrainingButtonProps & TrainingContextProviderProps> = React.memo(
    ({ locale, modules, expanded }) => {
        return (
            <SnackbarProvider>
                <TrainingContextProvider locale={locale} modules={modules}>
                    <MainComponent expanded={expanded} />
                </TrainingContextProvider>
            </SnackbarProvider>
        );
    }
);

interface TrainingButtonProps {
    expanded: boolean;
}

const MainComponent: React.FC<TrainingButtonProps> = React.memo(({ expanded }) => {
    const { appState, setAppState, module } = useTrainingContext();

    const exitTutorial = useCallback(() => {
        setAppState(appState => ({ ...appState, minimized: true }));
    }, [setAppState]);

    if (appState.minimized) {
        return (
            <ActionButton
                onClick={() => setAppState(appState => ({ ...appState, minimized: false }))}
                expanded={expanded}
            />
        );
    } else if (appState.type !== "TRAINING") return null;

    return (
        <>
            <ActionButton
                onClick={() => setAppState(appState => ({ ...appState, minimized: true }))}
                expanded={expanded}
            />
            <TrainingWizard onClose={exitTutorial} module={module} />
        </>
    );
});
