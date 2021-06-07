//@ts-ignore
import { useConfig } from "@dhis2/app-runtime";
//@ts-ignore
import { HeaderBar } from "@dhis2/ui-widgets";
import { LinearProgress } from "@material-ui/core";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { SnackbarProvider } from "d2-ui-components";
import _ from "lodash";
//@ts-ignore
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import React, { useEffect, useState } from "react";
import { appConfig } from "../../../app-config";
import { getCompositionRoot } from "../../../compositionRoot";
import { User } from "../../../models/User";
import { D2Api } from "../../../types/d2-api";
import { AppContext, AppContextState } from "../../contexts/app-context";
import Root from "../../pages/root/RootPage";
import Share from "../share/Share";
import "./App.css";
import muiThemeLegacy from "./themes/dhis2-legacy.theme";
import { muiTheme } from "./themes/dhis2.theme";

type D2 = object;

type AppWindow = Window & {
    $: {
        feedbackDhis2: (d2: D2, appKey: string, feedbackOptions: object) => void;
    };
};

function initFeedbackTool(d2: D2, appConfig: AppConfig): void {
    const appKey = _(appConfig).get("appKey");

    if (appConfig && appConfig.feedback) {
        const feedbackOptions = {
            ...appConfig.feedback,
            i18nPath: "feedback-tool/i18n",
        };
        ((window as unknown) as AppWindow).$.feedbackDhis2(d2, appKey, feedbackOptions);
    }
}

const App = ({ api, d2 }: { api: D2Api; d2: D2 }) => {
    const { baseUrl } = useConfig();

    const [showShareButton, setShowShareButton] = useState(false);
    const [loading, setLoading] = useState(true);
    const [appContext, setAppContext] = useState<AppContextState | null>(null);

    useEffect(() => {
        async function setup() {
            const compositionRoot = getCompositionRoot(api);
            const [config, currentUser] = await Promise.all([{}, User.getCurrent(api)]);
            const appContext: AppContextState = { d2, api, config, currentUser, compositionRoot };

            setAppContext(appContext);
            setShowShareButton(_(appConfig).get("appearance.showShareButton") || false);
            initFeedbackTool(d2, appConfig);
            setLoading(false);
        }
        setup();
    }, [d2, api, baseUrl]);

    if (loading) {
        return (
            <div style={{ margin: 20 }}>
                <h3>Connecting to {baseUrl}...</h3>
                <LinearProgress />
            </div>
        );
    }

    return (
        <MuiThemeProvider theme={muiTheme}>
            <OldMuiThemeProvider muiTheme={muiThemeLegacy}>
                <SnackbarProvider>
                    <HeaderBar appName={"Data Management"} />

                    <div id="app" className="content">
                        <AppContext.Provider value={appContext}>
                            <Root />
                        </AppContext.Provider>
                    </div>

                    <Share visible={showShareButton} />
                </SnackbarProvider>
            </OldMuiThemeProvider>
        </MuiThemeProvider>
    );
};

export interface AppConfig {
    appKey: string;
    appearance: {
        showShareButton: boolean;
    };
    feedback?: {
        token: string[];
        createIssue: boolean;
        sendToDhis2UserGroups: string[];
        issues: {
            repository: string;
            title: string;
            body: string;
        };
        snapshots: {
            repository: string;
            branch: string;
        };
        feedbackOptions: object;
    };
}

export default React.memo(App);
