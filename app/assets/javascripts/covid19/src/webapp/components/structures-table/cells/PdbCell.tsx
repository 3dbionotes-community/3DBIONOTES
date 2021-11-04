import React from "react";
import i18n from "../../../../utils/i18n";
import { CellProps } from "../Columns";
import { Thumbnail } from "../Thumbnail";
import { Link } from "../Link";

export const PdbCell: React.FC<CellProps> = React.memo(props => {
    const { pdb } = props.row;

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

    return pdb ? (
        <Link key={pdb.id} tooltip={tooltip}>
            <Thumbnail type="pdb" value={pdb} />
        </Link>
    ) : null;
});
