import _ from "lodash";
import React, { useContext, useEffect, useState } from "react";
import {
    AppState,
    buildTranslate,
    TrainingModule,
    TranslateMethod,
} from "../../domain/entities/TrainingApp";
import { modules } from "./training-modules";

const TrainingContext = React.createContext<TrainingContextState | null>(null);

export const TrainingContextProvider: React.FC<TrainingContextProviderProps> = ({
    children,
    locale,
}) => {
    const [appState, setAppState] = useState<AppState>({ type: "TRAINING", state: "OPEN", minimized: true, module: "test", step: 1, content: 1 });
    const translate = buildTranslate(locale);

    useEffect(() => cacheImages(JSON.stringify(modules)), []);

    return (
        <TrainingContext.Provider
            value={{
                appState,
                setAppState,
                modules,
                translate,
            }}
        >
            {children}
        </TrainingContext.Provider>
    );
};

export function useTrainingContext(): UseTrainingContextResult {
    const context = useContext(TrainingContext);
    if (!context) throw new Error("Context not initialized");

    const { appState, setAppState, modules, translate } = context;
    const [module, setCurrentModule] = useState<TrainingModule>();

    useEffect(() => {
        if (appState.type !== "TRAINING" && appState.type !== "TRAINING_DIALOG") return;
        setCurrentModule(modules.find(({ id }) => id === appState.module));
    }, [appState, modules]);

    return {
        appState,
        setAppState,
        modules,
        module,
        translate,
    };
}

type AppStateUpdateMethod = (oldState: AppState) => AppState;

export interface TrainingContextProviderProps {
    locale: string;
}

export interface TrainingContextState {
    appState: AppState;
    setAppState: (appState: AppState | AppStateUpdateMethod) => void;
    modules: TrainingModule[];
    translate: TranslateMethod;
}

interface UseTrainingContextResult {
    appState: AppState;
    setAppState: (appState: AppState | AppStateUpdateMethod) => void;
    modules: TrainingModule[];
    module?: TrainingModule;
    translate: TranslateMethod;
}

export const cacheImages = (contents: string) => {
    const images = extractImageUrls(contents);
    for (const image of images) {
        const container = new Image();
        container.src = image;
    }
};

export const extractImageUrls = (contents: string): string[] => {
    return [...extractMarkdownImages(contents), ...extractHTMLImages(contents)];
};

const extractMarkdownImages = (contents: string): string[] => {
    const regex = /!\[[^\]]*\]\((?<url>.*?)\s*(?="|\))(?<title>".*")?\)/g;
    return _(Array.from(contents.matchAll(regex)))
        .map(({ groups }) => groups?.url)
        .compact()
        .uniq()
        .value();
};

const extractHTMLImages = (contents: string): string[] => {
    const regex = /src\s*=\s*"(?<url>.+?)"/g;
    return _(Array.from(contents.matchAll(regex)))
        .map(({ groups }) => groups?.url)
        .compact()
        .uniq()
        .value();
};
