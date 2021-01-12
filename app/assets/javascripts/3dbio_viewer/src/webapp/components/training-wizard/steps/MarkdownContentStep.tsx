import React from "react";
import { MarkdownViewer } from "../../markdown-viewer/MarkdownViewer";
import { ModalContent } from "../../modal/ModalContent";
import { TrainingWizardStepProps } from "../TrainingWizard";
import { StepHeader } from "./StepHeader";

export const MarkdownContentStep: React.FC<TrainingWizardStepProps> = ({
    content,
    title = "",
    subtitle,
    stepIndex = 0,
    contentIndex = 0,
    totalContents = 0,
    minimized,
}) => {
    const positionText =
        totalContents > 1
            ? `Sub step ${contentIndex + 1} of ${totalContents}`
            : undefined;

    return (
        <ModalContent>
            <StepHeader index={stepIndex + 1} title={title} subtitle={subtitle ?? positionText} />
            {content && !minimized ? <MarkdownViewer source={content} /> : null}
        </ModalContent>
    );
};
