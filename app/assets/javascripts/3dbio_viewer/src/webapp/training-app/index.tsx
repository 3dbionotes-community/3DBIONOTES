import React, { useCallback } from "react";
import {
    TrainingContextProvider,
    TrainingContextProviderProps,
    useTrainingContext,
} from "./contexts/training-context";
import { ActionButton } from "./components/action-button/ActionButton";
import { TrainingWizard } from "./components/training-wizard/TrainingWizard";

export const TrainingApp: React.FC<TrainingContextProviderProps> = React.memo(props => {
    return (
        <TrainingContextProvider {...props}>
            <MainComponent />
        </TrainingContextProvider>
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

    return <TrainingWizard onClose={exitTutorial} module={module} />;
});
