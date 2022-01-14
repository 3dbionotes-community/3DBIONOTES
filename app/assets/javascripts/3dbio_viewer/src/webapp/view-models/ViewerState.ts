import { Profile } from "../../domain/entities/Profile";
import { Selection } from "./Selection";

export interface ViewerState {
    selection: Selection;
    profile: Profile;
}
