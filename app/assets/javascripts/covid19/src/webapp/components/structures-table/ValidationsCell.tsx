import React from "react";
import i18n from "../../../utils/i18n";
import { CellProps } from "./Columns";
import { BadgeLink } from "./BadgeLink";

export const ValidationsCell: React.FC<CellProps> = React.memo(props => {
    const { validations } = props.row;

    return (
        <div>
            {validations.pdb.map(pdbValidation => {
                switch (pdbValidation.type) {
                    case "pdbRedo":
                        return (
                            <React.Fragment key="pdb-redo">
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
                            <BadgeLink
                                key="pdb-isolde"
                                url={pdbValidation.queryLink}
                                text={i18n.t("Isolde")}
                                icon="viewer"
                                color={pdbValidation.badgeColor}
                            />
                        );
                    default:
                        throw new Error("Unsupported");
                }
            })}

            {validations.emdb.map(emdbValidation => (
                <BadgeLink key={emdbValidation} text={emdbValidation} />
            ))}
        </div>
    );
});
