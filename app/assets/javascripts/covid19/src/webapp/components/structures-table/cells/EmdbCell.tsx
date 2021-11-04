import React from "react";
import { CellProps } from "../Columns";
import { Thumbnail } from "../Thumbnail";
import i18n from "../../../../utils/i18n";
import { Link } from "../Link";

export const EmdbCell: React.FC<CellProps> = React.memo(props => {
    const { emdb } = props.row;

    const tooltip = (
        <React.Fragment>
            <div>
                {i18n.t("ID")}: {emdb?.id}
            </div>
            <div>
                {i18n.t("Method")}: {emdb?.emMethod}
            </div>
            {emdb?.resolution && (
                <div>
                    {i18n.t("Resolution")}: {emdb?.resolution}
                </div>
            )}
        </React.Fragment>
    );

    return emdb ? (
        <Link key={emdb.id} tooltip={tooltip}>
            <Thumbnail type="pdb" value={emdb} />
        </Link>
    ) : null;
});
