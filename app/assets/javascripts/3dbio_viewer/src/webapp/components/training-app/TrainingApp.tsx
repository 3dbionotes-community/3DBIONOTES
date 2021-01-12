import React, { useCallback } from "react";
import { useTrainingContext } from "../../contexts/training-context";
import { ActionButton } from "../action-button/ActionButton";
import { TrainingWizard } from "../training-wizard/TrainingWizard";

export const TrainingApp: React.FC = React.memo(() => {
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
