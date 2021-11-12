import React from "react";
import i18n from "../../../../utils/i18n";
import { CellProps } from "../Columns";
import { Thumbnail } from "../Thumbnail";
import { BadgeLink } from "../BadgeLink";

export const PdbCell: React.FC<CellProps> = React.memo(props => {
    const { pdb, validations } = props.row;

    const tooltip = (
        <React.Fragment>
            <div>
                {i18n.t("ID")}: {pdb?.id}
            </div>
            <div>
                {i18n.t("Method")}: {pdb?.method}
            </div>
            <div>
                {i18n.t("Keywords")}: {pdb?.keywords}
            </div>
            <div>
                {i18n.t("Entities")}: {pdb?.entities.map(entity => entity.name).join(", ")}
            </div>
            {pdb?.ligands.length !== 0 && (
                <div>
                    {i18n.t("Ligands")}: {pdb?.ligands.join(", ")}
                </div>
            )}
        </React.Fragment>
    );

    return (
        <React.Fragment>
            {pdb ? <Thumbnail type="pdb" value={pdb} tooltip={tooltip} /> : null}
            {validations ? (
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
            ) : null}
        </React.Fragment>
    );
});
