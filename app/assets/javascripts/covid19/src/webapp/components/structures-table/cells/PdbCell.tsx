import React from "react";
import _ from "lodash";
import i18n from "../../../../utils/i18n";
import { CellProps } from "../Columns";
import { Thumbnail } from "../Thumbnail";
import { BadgeLink } from "../BadgeLink";
import { Pdb, Structure } from "../../../../domain/entities/Covid19Info";

export const PdbCell: React.FC<CellProps> = React.memo(props => {
    const { pdb } = props.row;
    return pdb ? <PdbCell2 structure={props.row} pdb={pdb} /> : null;
});

const PdbCell2: React.FC<{ structure: Structure; pdb: Pdb }> = React.memo(props => {
    const { pdb, structure } = props;
    const pdbValidations = structure.validations.pdb;

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
                //console.log(pdbValidations)
    return (
        <React.Fragment>
            {pdb ? <Thumbnail type="pdb" value={pdb} tooltip={tooltip} /> : null}

            {!_.isEmpty(pdbValidations) ? (
                <div>
                    {pdbValidations.map(pdbValidation => {
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
                </div>
            ) : null}
        </React.Fragment>
    );
});
