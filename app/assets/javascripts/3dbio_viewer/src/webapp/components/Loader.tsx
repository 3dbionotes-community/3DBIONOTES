import React from "react";

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
            {state.type === "error" && (
                <div className="pdb-info-error">
                    <i className="icon icon-common icon-exclamation-triangle"></i>
                    <p>{state.message}</p>
                </div>
            )}
        </div>
    );
}
