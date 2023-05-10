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
}

export function Loader<Data>(props: LoaderProps<Data>) {
    const { state } = props;

    return (
        <div>
            {state.type === "error" ? <div style={styles.section}>{state.message}</div> : null}
        </div>
    );
}

const styles = {
    section: { padding: 20 },
};
