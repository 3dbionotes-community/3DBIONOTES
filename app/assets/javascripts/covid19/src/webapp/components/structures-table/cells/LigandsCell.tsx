import React from "react";
import i18n from "../../../../utils/i18n";
import { CellProps, styles } from "../Columns";
import { Link } from "../Link";
import { CenteredTextBox } from "../CenteredTextBox";

export const LigandsCell: React.FC<CellProps> = React.memo(props => {
    const { row } = props;

    const ligands = React.useMemo(() => {
        return row.ligands.map(ligandInstance => {
            const ligand = ligandInstance.info;
            return {
                id: ligand.id,
                url: ligand.externalLink,
                tooltip: (
                    <React.Fragment>
                        {ligand.names.map(name => (
                            <div key={name}>{name}</div>
                        ))}
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
