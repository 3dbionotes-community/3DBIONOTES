import React from "react";
import i18n from "../../utils/i18n";
import styles from "../protvista/Protvista.module.css";

interface PPiViewerProps {
    pdb?: string;
}

export const PPIViewer: React.FC<PPiViewerProps> = props => {
    const { pdb } = props;
    const src = `/ppiIFrame?pdb=${pdb || "6w9c"}`;

    return (
        <div id="ppi" className={styles.section}>
            <div className={styles.title}>
                {i18n.t("PPI: Protein–protein interactions")}
                <button>?</button>
            </div>

            <div className="contents">
                {i18n.t(
                    "Protein–protein interactions (PPIs) are physical contacts of high specificity established between two or more protein molecules as a result of biochemical events steered by interactions that include electrostatic forces, hydrogen bonding and the hydrophobic effect. Many are physical contacts with molecular associations between chains that occur in a cell or in a living organism in a specific biomolecular context."
                )}
            </div>

            <iframe src={src} width="100%" height="800" />
        </div>
    );
};
