import { Profile } from "../../domain/entities/Profile";
import { Selection } from "./Selection";

export interface ViewerState {
    selection: Selection;
    setSelection(selection: Selection): void;
    profile: Profile;
    setProfile(profile: Profile): void;
}
