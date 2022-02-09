import React from "react";
import _ from "lodash";
import queryString from "query-string";
import { useGoto } from "../../hooks/use-goto";
import {
    getSelectionFromString,
    getSelectionFromToken,
    getStringFromSelection,
    Selection,
} from "../../view-models/Selection";
import {
    getProfileFromString,
    getStringFromProfile,
    Profile,
} from "../../../domain/entities/Profile";
import { ViewerState } from "../../view-models/ViewerState";
import { useLocation, useParams } from "react-router-dom";
import { Maybe } from "../../../utils/ts-utils";

/* Examples:
    /3brv
    /3brv+EMD-21375
    /3brv+EMD-21375|6zow
    /3brv+EMD-21375|6zow/structural
*/

export interface SelectorParams {
    selection?: string;
    profile?: string;
}

interface UploadedParams {
    token: string;
    chain: Maybe<string>;
    profile?: string;
}

type Section = { type: "selector" } | { type: "uploaded" };

export function useViewerState(section: Section): ViewerState {
    const goTo = useGoto();
    const params = useMemoObject(useParams());
    const location = useMemoObject(useLocation());

    const values = React.useMemo(() => {
        if (section.type === "selector") {
            const params2 = params as SelectorParams;
            const selection = getSelectionFromString(params2.selection);
            const profile = getProfileFromString(params2.profile);
            return { selection, profile };
        } else {
            const values = queryString.parse(location.search);
            const params2 = {
                ...params,
                chain: values.chain,
                profile: values.profile,
            } as UploadedParams;
            const selection = getSelectionFromToken(params2.token, params2.chain);
            const profile = getProfileFromString(params2.profile);
            return { selection, profile };
        }
    }, [params, section.type, location]);

    const goToPath = React.useCallback(
        (selection: Selection, profile: Profile) => {
            const profilePath = getStringFromProfile(profile);

            if (selection.main.type === "normal") {
                const selectionPath = getStringFromSelection(selection);
                const newPath = _([selectionPath, profilePath]).compact().join("/");
                goTo("/" + newPath);
            } else {
                const params = { chain: selection.chainId, profile: profilePath };
                const query = queryString.stringify(params);
                goTo(`/uploaded/${selection.main.token}` + (query ? `?${query}` : ""));
            }
        },
        [goTo]
    );

    const setSelection = React.useCallback(
        (newSelection: Selection) => {
            return goToPath(newSelection, values.profile);
        },
        [goToPath, values.profile]
    );

    const setProfile = React.useCallback(
        (newProfile: Profile) => goToPath(values.selection, newProfile),
        [goToPath, values.selection]
    );

    const { selection, profile } = values;

    const viewerState = React.useMemo(() => {
        return { selection, setSelection, profile, setProfile };
    }, [selection, setSelection, profile, setProfile]);

    return viewerState;
}

/* Return memoized object (must be JSON serializable) */

function useMemoObject<T>(obj: T): T {
    const json = JSON.stringify(obj);
    return React.useMemo(() => JSON.parse(json), [json]);
}
