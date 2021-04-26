import { Profile } from "../../domain/entities/Profile";
import { Selection } from "./Selection";

export interface AppState {
    selection: Selection;
    profile: Profile;
}

/*
class AppStateMethods {
    constructor(private appState: AppState) {}

    getPath

    setSelection(newSelection: Selection): AppStateMethods {

    }

}
*/
