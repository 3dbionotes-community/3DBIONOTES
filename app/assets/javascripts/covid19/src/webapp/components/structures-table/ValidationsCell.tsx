import React from "react";
import i18n from "../../../utils/i18n";
import { CellProps } from "./Columns";
import { BadgeLink } from "./BadgeLink";

export const ValidationsCell: React.FC<CellProps> = React.memo(props => {
    const { pdb, emdb } = props.row;
    const pdbValidations = pdb?.validations || [];
    const emdbValidations = emdb?.validations || [];

    return (
        <div>
            {pdbValidations.map(pdbValidation => {
                switch (pdbValidation.type) {
                    case "pdbRedo":
                        return (
                            <React.Fragment>
                                <BadgeLink
                                    key="pdb-redo-external"
                                    url={pdbValidation.externalLink}
                                    text={i18n.t("PDB-Redo")}
                                    icon="external"
                                    color={pdbValidation.badgeColor}
                                />

                                <BadgeLink
                                    key="pdb-redo-viewer"
                                    url={pdbValidation.queryLink}
                                    text={i18n.t("PDB-Redo")}
                                    icon="viewer"
                                    color={pdbValidation.badgeColor}
                                />
                            </React.Fragment>
                        );
                    case "isolde":
                        return (
                            <React.Fragment>
                                <BadgeLink
                                    key="pdb-isolde"
                                    url={pdbValidation.queryLink}
                                    text={i18n.t("Isolde")}
                                    icon="viewer"
                                    color={pdbValidation.badgeColor}
                                />
                            </React.Fragment>
                        );
                    default:
                        throw new Error("Unsupported");
                }
            })}

            {emdbValidations.map(emdbValidation => (
                <BadgeLink key={emdbValidation} text={emdbValidation} />
            ))}
        </div>
    );
});
