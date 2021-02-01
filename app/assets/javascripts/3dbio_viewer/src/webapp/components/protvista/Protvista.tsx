import React from "react";
import i18n from "../../utils/i18n";
import { useAppContext } from "../AppContext";
import { Block } from "./Block";
import { getBlocks } from "./Protvista.helpers";
import { ProtvistaBlock } from "./Protvista.types";
import styles from "./Protvista.module.css";

export type State =
    | { type: "loading" }
    | { type: "loaded"; blocks: ProtvistaBlock[] }
    | { type: "error"; message: String };

export const Protvista: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const [state, setState] = React.useState<State>({ type: "loading" });

    React.useEffect(() => {
        const pdbOptions = {
            "6zow": { protein: "P0DTC2", pdb: "6zow", chain: "A" },
            "6lzg": { protein: "Q9BYF1", pdb: "6lzg", chain: "A" },
            "6w9c": { protein: "P0DTD1", pdb: "6w9c", chain: "A" },
            "1iyj": { protein: "P60896", pdb: "1iyj", chain: "A" },
        };

        setState({ type: "loading" });

        return compositionRoot.getPdb(pdbOptions["6zow"]).run(
            pdb => setState({ type: "loaded", blocks: getBlocks(pdb) }),
            error => setState({ type: "error", message: error.message })
        );
    }, [compositionRoot, setState]);

    return (
        <div>
            {state.type === "loading" ? (
                i18n.t("Loading...")
            ) : state.type === "error" ? (
                <div>
                    {i18n.t("Error")}: {state.message}
                </div>
            ) : (
                <div>
                    <div className={styles.section}>
                        <div className={styles.actions}>
                            <button>Tools</button>
                            <button>Profiles</button>
                            <button>?</button>
                        </div>
                    </div>

                    {state.blocks.map(block => (
                        <Block key={block.title} block={block} />
                    ))}
                </div>
            )}
        </div>
    );
};
