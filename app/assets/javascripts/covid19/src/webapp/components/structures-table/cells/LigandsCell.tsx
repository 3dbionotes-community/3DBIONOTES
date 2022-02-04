import React from "react";
import i18n from "../../../../utils/i18n";
import { CellProps, styles } from "../Columns";
import { Link } from "../Link";

export const LigandsCell: React.FC<CellProps> = React.memo(props => {
    const { row } = props;

    const ligands = React.useMemo(() => {
        return row.ligands.map(ligand => {
            return {
                id: ligand.id,
                url: ligand.externalLink,
                name: ligand.name,
                tooltip: (
                    <React.Fragment>
                        <div>
                            {i18n.t("ID")}: {ligand.id}
                        </div>
                        <div>
                            {i18n.t("Name")}: {ligand.name}
                        </div>

                        {ligand.details !== ligand.name && (
                            <div>
                                {i18n.t("Details")}: {ligand.details}
                            </div>
                        )}

                        {ligand.imageLink && (
                            <img alt={ligand.id} src={ligand.imageLink} style={styles.image} />
                        )}
                    </React.Fragment>
                ),
            };
        });
    }, [row.ligands]);

    return (
        <ul>
            {ligands.map(ligand => (
                <Link
                    key={ligand.id}
                    tooltip={ligand.tooltip}
                    url={ligand.url}
                    text={ligand.name}
                />
            ))}
        </ul>
    );
});