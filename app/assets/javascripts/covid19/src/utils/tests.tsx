import { render, RenderResult } from "@testing-library/react";
import { SnackbarProvider } from "d2-ui-components";
import React, { ReactNode } from "react";
import { getCompositionRoot } from "../compositionRoot";
import { getMockApi } from "../types/d2-api";
import { AppContext, AppContextState } from "../webapp/contexts/app-context";
import { User } from "./../models/User";

export function getTestUser() {
    return new User({
        id: "xE7jOejl9FI",
        displayName: "John Traore",
        username: "admin",
        organisationUnits: [
            {
                level: 1,
                id: "ImspTQPwCqd",
                path: "/ImspTQPwCqd",
            },
        ],
        userRoles: [],
    });
}

export function getTestConfig() {
    return {};
}

export function getTestD2() {
    return {};
}

export function getTestContext() {
    const { api, mock } = getMockApi();
    const context = {
        api: api,
        d2: getTestD2(),
        currentUser: getTestUser(),
        config: getTestConfig(),
        compositionRoot: getCompositionRoot(api),
    };

    return { mock, api, context };
}

export function getReactComponent(children: ReactNode, context: AppContextState): RenderResult {
    return render(
        <AppContext.Provider value={context}>
            <SnackbarProvider>{children}</SnackbarProvider>
        </AppContext.Provider>
    );
}
