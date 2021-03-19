import React from "react";
import i18n from "../utils/i18n";

export type LoaderState<Data> =
    | { type: "loading" }
    | { type: "loaded"; data: Data }
    | { type: "error"; message: String };

export function useLoader<Data>() {
    return React.useState<LoaderState<Data>>({ type: "loading" });
}

export interface LoaderProps<Data> {
    state: LoaderState<Data>;
    loadingMsg?: string;
}

export function Loader<Data>(props: LoaderProps<Data>) {
    const { state, loadingMsg } = props;

    return (
        <div>
            {state.type === "loading" ? (
                <div style={styles.section}>{loadingMsg || i18n.t("Loading...")}</div>
            ) : state.type === "error" ? (
                <div style={styles.section}>
                    {i18n.t("Error")}: {state.message}
                </div>
            ) : null}
        </div>
    );
}

const styles = {
    section: { padding: 20 },
};
