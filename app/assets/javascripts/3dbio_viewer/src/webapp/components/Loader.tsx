import React from "react";
import i18n from "../utils/i18n";

export type LoaderState<Data> =
    | { type: "loading" }
    | { type: "loaded"; data: Data }
    | { type: "error"; message: String };

export function useLoader<Data>() {
    return React.useState<LoaderState<Data>>({ type: "loading" });
}

export function Loader<Data>(props: { state: LoaderState<Data> }) {
    const { state } = props;
    return (
        <div>
            {state.type === "loading" ? (
                <div style={styles.section}>{i18n.t("Loading Protvista...")}</div>
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
