import React from "react";
import _ from "lodash";
import { useGoto } from "../../hooks/use-goto";
import {
    getSelectionFromString,
    getStringFromSelection,
    Selection,
} from "../../view-models/Selection";
import {
    getProfileFromString,
    getStringFromProfile,
    Profile,
} from "../../../domain/entities/Profile";
import { ViewerState } from "../../view-models/ViewerState";
import { useParams } from "react-router-dom";

/* Examples:
    /3brv
    /3brv+EMD-21375
    /3brv+EMD-21375|6zow
    /3brv+EMD-21375|6zow/structural
*/

export interface Selector {
    selection?: string;
    profile?: string;
}

export function useViewerState(): [
    ViewerState,
    { setSelection: (selection: Selection) => void; setProfile: (profile: Profile) => void }
] {
    const goTo = useGoto();
    const params = useParams<Selector>();

    const viewerState = React.useMemo<ViewerState>(() => {
        const selection = getSelectionFromString(params.selection);
        const profile = getProfileFromString(params.profile);
        return { selection, profile };
    }, [params.selection, params.profile]);

    const goToPath = React.useCallback(
        (selection: Selection, profile: Profile) => {
            const selectionPath = getStringFromSelection(selection);
            const profilePath = getStringFromProfile(profile);
            const newPath = _([selectionPath, profilePath]).compact().join("/");
            goTo("/" + newPath);
        },
        [goTo]
    );

    const setSelection = React.useCallback(
        (newSelection: Selection) => goToPath(newSelection, viewerState.profile),
        [goToPath, viewerState.profile]
    );

    const setProfile = React.useCallback(
        (newProfile: Profile) => goToPath(viewerState.selection, newProfile),
        [goToPath, viewerState.selection]
    );

    const setViewerState = React.useMemo(() => {
        return { setSelection, setProfile };
    }, [setSelection, setProfile]);

    return [viewerState, setViewerState];
}
