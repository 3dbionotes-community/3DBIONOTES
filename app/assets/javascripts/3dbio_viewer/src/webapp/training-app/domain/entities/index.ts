import { ReactNode } from "react";

export type TrainingModuleType = "app" | "core" | "widget";

export interface TrainingModule {
    id: string;
    name: TranslatableText;
    type: TrainingModuleType;
    contents: TrainingModuleContents;
}

export interface TrainingModuleContents {
    welcome: TranslatableText;
    steps: TrainingModuleStep[];
}

export interface TrainingModuleStep {
    title: TranslatableText;
    subtitle?: TranslatableText;
    pages: TranslatableText[];
}

export interface TrainingModuleBuilder {
    id: string;
    name: string;
    poEditorProject: string;
}

export const extractStepFromKey = (key: string): { step: number; content: number } | null => {
    const match = /^.*-(\d*)-(\d*)$/.exec(key);
    if (!match || !match[1] || !match[2]) return null;

    return { step: parseInt(match[1]), content: parseInt(match[2]) };
};

export const isValidTrainingType = (type: string): type is TrainingModuleType => {
    return ["app", "core", "widget"].includes(type);
};

export interface TranslatableText {
    key: string;
    referenceValue: string;
    translations: Record<string, string>;
}

export const buildTranslate = (locale: string): TranslateMethod => {
    return (text: TranslatableText): string => {
        const translations = text.translations ?? {};
        return translations[locale] || text.referenceValue;
    };
};

export type TranslateMethod = (string: TranslatableText) => string;

export type TrainingStateType = "OPEN" | "MINIMIZED";
export type AppStateType = "HOME" | "TRAINING" | "TRAINING_DIALOG" | "UNKNOWN" | "SETTINGS";

interface BaseAppState {
    type: AppStateType;
    exit?: boolean;
    minimized?: boolean;
}

interface UnknownAppState extends BaseAppState {
    type: "UNKNOWN";
}

interface HomeAppState extends BaseAppState {
    type: "HOME";
}

interface TrainingAppState extends BaseAppState {
    type: "TRAINING";
    state: TrainingStateType;
    module: string;
    step: number;
    content: number;
}

interface TrainingDialogAppState extends BaseAppState {
    type: "TRAINING_DIALOG";
    module: string;
    dialog: "welcome" | "final" | "summary" | "contents";
}

interface SettingsAppState extends BaseAppState {
    type: "SETTINGS";
}

export type AppState =
    | UnknownAppState
    | HomeAppState
    | TrainingAppState
    | TrainingDialogAppState
    | SettingsAppState;

export const buildPathFromState = (state: AppState): string => {
    switch (state.type) {
        case "HOME":
            return `/`;
        case "TRAINING":
            return `/tutorial/${state.module}/${state.step}/${state.content}`;
        case "TRAINING_DIALOG":
            return `/tutorial/${state.module}/${state.dialog}`;
        case "SETTINGS":
            return `/settings`;
        default:
            return "/";
    }
};

export interface ReactRouterRoute {
    caseSensitive: boolean;
    children?: ReactRouterRoute[];
    element: ReactNode;
    path: string;
}

export interface ReactRouterMatch {
    route: ReactRouterRoute;
    pathname: string;
    params: Record<string, string>;
}

export const buildStateFromPath = (matches: ReactRouterMatch[]): AppState => {
    for (const match of matches) {
        const { key: module_, step, content } = match.params;
        if (!module_ || !step || !content) continue;

        switch (match.route.path) {
            case "/":
                return { type: "HOME" };
            case "/tutorial/:key":
            case "/tutorial/:key/welcome":
                return { type: "TRAINING_DIALOG", dialog: "welcome", module: module_ };
            case "/tutorial/:key/contents":
                return { type: "TRAINING_DIALOG", dialog: "contents", module: module_ };
            case "/tutorial/:key/summary":
                return { type: "TRAINING_DIALOG", dialog: "summary", module: module_ };
            case "/tutorial/:key/final":
                return { type: "TRAINING_DIALOG", dialog: "final", module: module_ };
            case "/tutorial/:key/:step/:content":
                return {
                    type: "TRAINING",
                    module: module_,
                    step: parseInt(step),
                    content: parseInt(content),
                    state: "OPEN",
                };
            case "/settings":
                return { type: "SETTINGS" };
        }
    }
    return { type: "HOME" };
};
