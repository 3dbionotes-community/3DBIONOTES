import { WizardNavigationProps } from "d2-ui-components";
import _ from "lodash";
import React, { useCallback } from "react";
import styled from "styled-components";
import { arrayFill } from "../../../utils/array";
import { MainButton } from "../../main-button/MainButton";
import { NavigationBullet } from "./NavigationBullet";

export const Navigation: React.FC<WizardNavigationProps> = ({
    steps,
    onNext,
    onPrev,
    currentStepKey,
}) => {
    const index = _(steps).findIndex(step => step.key === currentStepKey);
    const currentStepIndex = index >= 0 ? index : 0;
    const currentStep = steps[currentStepIndex];

    const prev = useCallback(() => {
        if (currentStepIndex > 0) onPrev();
    }, [onPrev, currentStepIndex]);

    const next = useCallback(() => {
        if (currentStepIndex !== steps.length - 1) onNext();
    }, [onNext, currentStepIndex, steps]);

    if (steps.length === 0) return null;
    const { contentIndex = 0, totalContents = 0 } = (currentStep.props as unknown) as any;

    return (
        <ModalFooter>
            {contentIndex - 1 < 0 ? (
                <MainButton onClick={prev} disabled={currentStepIndex <= 0}>
                    {"Previous step"}
                </MainButton>
            ) : (
                <MainButton onClick={prev} color="secondary" disabled={currentStepIndex <= 0}>
                    {"Previous"}
                </MainButton>
            )}
            <ProgressBar>
                {totalContents > 1
                    ? arrayFill(totalContents).map(value => (
                          <NavigationBullet key={value} completed={value === contentIndex} />
                      ))
                    : null}
            </ProgressBar>
            {contentIndex + 1 === totalContents ? (
                <MainButton onClick={next} disabled={currentStepIndex === steps.length - 1}>
                    {"Next step"}
                </MainButton>
            ) : (
                <MainButton
                    onClick={next}
                    color="secondary"
                    disabled={currentStepIndex === steps.length - 1}
                >
                    {"Next"}
                </MainButton>
            )}
        </ModalFooter>
    );
};

const ModalFooter = styled.div`
    overflow: hidden;
    margin: 20px 0px 20px;
    text-align: center;
`;

const ProgressBar = styled.div`
    display: inline-flex;
    justify-content: center;
    align-items: flex-end;
    width: 25%;
    margin: 0 auto;
    place-content: space-evenly;
`;
