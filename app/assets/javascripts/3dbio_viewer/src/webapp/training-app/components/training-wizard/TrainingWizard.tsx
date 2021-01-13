import { Wizard } from "d2-ui-components";
import _ from "lodash";
import React, { useCallback, useMemo, useRef } from "react";
import styled from "styled-components";
import { extractStepFromKey, TrainingModule } from "../../domain/entities";
import { useTrainingContext } from "../../contexts/training-context";
import { Modal } from "../modal/Modal";
import { ModalContent } from "../modal/ModalContent";
import { Navigation } from "./navigation/Navigation";
import { Stepper } from "./stepper/Stepper";
import { MarkdownContentStep } from "./steps/MarkdownContentStep";

export interface TrainingWizardProps {
    onClose: () => void;
    module?: TrainingModule;
}

export interface TrainingWizardStepProps {
    title?: string;
    subtitle?: string;
    description?: string;
    content?: string;
    minimized?: boolean;
    stepIndex?: number;
    contentIndex?: number;
    totalSteps?: number;
    totalContents?: number;
}

export const TrainingWizard: React.FC<TrainingWizardProps> = ({ onClose, module }) => {
    const { appState, setAppState, translate } = useTrainingContext();
    const lastStep = useRef<string>();

    const minimized = useMemo(
        () => appState.type === "TRAINING" && appState.state === "MINIMIZED",
        [appState]
    );

    const wizardSteps = useMemo(() => {
        if (!module) return [];
        return _.flatMap(module.contents.steps, ({ title, subtitle, pages }, step) =>
            pages.map((content, position) => {
                const props: TrainingWizardStepProps = {
                    title: translate(title),
                    subtitle: subtitle ? translate(subtitle) : undefined,
                    content: translate(content),
                    stepIndex: step,
                    contentIndex: position,
                    totalSteps: module.contents.steps.length,
                    totalContents: pages.length,
                    minimized,
                };

                return {
                    key: `${module.id}-${step + 1}-${position + 1}`,
                    module,
                    label: "Select your location",
                    component: MarkdownContentStep,
                    props,
                };
            })
        );
    }, [module, minimized, translate]);

    const stepKey = useMemo(() => {
        if (appState.type !== "TRAINING" || !module) return undefined;
        const key = `${module.id}-${appState.step}-${appState.content}`;
        return wizardSteps.find(step => step.key === key) ? key : wizardSteps[0]?.key;
    }, [appState, module, wizardSteps]);

    const onStepChange = useCallback(
        async (stepKey: string) => {
            console.log("foo", stepKey);
            if (!module || lastStep.current === stepKey) return;

            const currentStep = extractStepFromKey(stepKey);
            if (!currentStep) return;

            lastStep.current = stepKey;
            setAppState(appState => {
                if (appState.type !== "TRAINING") return appState;
                return { ...appState, ...currentStep };
            });
        },
        [setAppState, module]
    );

    if (!module || wizardSteps.length === 0) return null;

    return (
        <StyledModal onClose={onClose} minimized={minimized} allowDrag={true}>
            <StyledWizard
                steps={wizardSteps}
                stepKey={stepKey}
                onStepChange={onStepChange}
                initialStepKey={wizardSteps[0].key}
                StepperComponent={minimized ? EmptyComponent : Stepper}
                NavigationComponent={minimized ? EmptyComponent : Navigation}
            />
        </StyledModal>
    );
};

const StyledWizard = styled(Wizard)`
    height: 100%;

    .MuiPaper-root {
        box-shadow: none;
        background-color: inherit;
        margin: inherit;
        height: 100%;
    }
`;

const StyledModal = styled(Modal)`
    position: fixed;
    margin: 6px;
    bottom: 20px;
    right: 40px;
    height: ${({ minimized }) => (minimized ? "inherit" : "75%")};

    ${ModalContent} {
        padding: 0px 15px;
        max-height: 75%;
    }

    ${StyledWizard} .MuiPaper-root {
        padding: ${({ minimized }) => (minimized ? "35px 0px 20px" : "inherit")};
    }
`;

const EmptyComponent = () => null;
