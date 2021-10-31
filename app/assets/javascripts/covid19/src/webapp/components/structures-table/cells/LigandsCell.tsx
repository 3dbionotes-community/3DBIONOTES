import React from "react";
import i18n from "../../../../utils/i18n";
import { CellProps, styles } from "../Columns";
import { CenteredTextBox } from "../CenteredTextBox";
import { Link } from "../Link";

export const LigandsCell: React.FC<CellProps> = React.memo(props => {
    const { row } = props;
    const ligands = React.useMemo(() => {
        return row.ligands.map(ligand => {
            return {
                id: ligand.id,
                url: ligand.externalLink,
                tooltip: (
                    <React.Fragment>
                        <div>{ligand.name}</div>

                        {ligand.details !== ligand.name && <div>{ligand.details}</div>}

                        {ligand.InnChIKey && (
                            <div>
                                {i18n.t("IUPAC InChI key")}: ${ligand.InnChIKey}
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
        <CenteredTextBox>
            {ligands.map(ligand => (
                <p key={ligand.id}>
                    <Link
                        key={ligand.id}
                        tooltip={ligand.tooltip}
                        url={ligand.url}
                        text={ligand.id}
                    />
                </p>
            ))}
        </CenteredTextBox>
    );
});
