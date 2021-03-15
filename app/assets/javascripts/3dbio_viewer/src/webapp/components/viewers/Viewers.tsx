import React from "react";
import _ from "lodash";
import { ProtvistaViewer } from "../protvista/ProtvistaViewer";
import i18n from "../../utils/i18n";
import styles from "./Viewers.module.css";
import { JumpToButton } from "../protvista/JumpToButton";
import { ProfilesButton } from "../protvista/ProfilesButton";
import { SelectionState } from "../../view-models/SelectionState";
import { useAppContext } from "../AppContext";
import { Pdb } from "../../../domain/entities/Pdb";
import { Loader, useLoader } from "../Loader";

export interface ViewersProps {
    selection: SelectionState;
}

export const Viewers: React.FC<ViewersProps> = props => {
    const { selection } = props;
    const { compositionRoot } = useAppContext();
    const [loader, setLoader] = useLoader<Pdb>();

    React.useEffect(() => {
        const pdbOptions = {
            "6zow": { protein: "P0DTC2", pdb: "6zow", chain: "A" },
            "6lzg": { protein: "O00141", pdb: "6lzg", chain: "A" },
            "6w9c": { protein: "P0DTD1", pdb: "6w9c", chain: "A" },
            "1iyj": { protein: "P60896", pdb: "1iyj", chain: "A" },
            "2R5T": { protein: "O00141", pdb: "2R5T", chain: "A" }, // Kinenasa
        };

        setLoader({ type: "loading" });

        return compositionRoot.getPdb(pdbOptions["6zow"]).run(
            pdb => setLoader({ type: "loaded", data: pdb }),
            error => setLoader({ type: "error", message: error.message })
        );
    }, [compositionRoot, setLoader]);

    return (
        <React.Fragment>
            <div className={styles.section}>
                <div className={styles.actions}>
                    <button>{i18n.t("Tools")}</button>
                    <ProfilesButton />
                    <JumpToButton />
                </div>
            </div>

            <Loader state={loader} loadingMsg={i18n.t("Loading data...")} />

            {loader.type === "loaded" && (
                <React.Fragment>
                    <ProtvistaViewer pdb={loader.data} selection={selection} />
                </React.Fragment>
            )}
        </React.Fragment>
    );
};
