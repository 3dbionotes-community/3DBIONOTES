import React from "react";
import _ from "lodash";
import i18n from "../../../../utils/i18n";
import { CellProps } from "../Columns";
import { Thumbnail } from "../Thumbnail";
import { BadgeLink } from "../BadgeLink";
import {
    buildPdbRedoValidation,
    Pdb,
    PdbValidation,
} from "../../../../domain/entities/Covid19Info";
import useLocalStorage from "react-use-localstorage";

export const PdbCell: React.FC<CellProps> = React.memo(props => {
    const { pdb } = props.row;
    return pdb ? <PdbCell2 pdb={pdb} /> : null;
});

const PdbCell2: React.FC<{ pdb: Pdb }> = React.memo(props => {
    const { pdb } = props;
    const pdbValidations = usePdbRedoValidations(pdb);

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

async function checkUrl(url: string): Promise<boolean> {
    try {
        const res = await fetch(url, { method: "HEAD" });
        return res.status === 200;
    } catch (err) {
        return false;
    }
}

const values = { true: "1", false: "0", undefined: "undefined" } as const;

function usePdbRedoValidations(pdb: Pdb): PdbValidation[] {
    const [hasPdbValidation, setHasPdbValidation] = useLocalStorage(
        `pdb-${pdb.id}`,
        values.undefined
    );

    const checkPdb = React.useCallback(async () => {
        const pdbRedoUrl = buildPdbRedoValidation(pdb.id).externalLink;
        const pdbRedoAvailable = await checkUrl(pdbRedoUrl);
        setHasPdbValidation(pdbRedoAvailable ? values.true : values.false);
    }, [pdb.id, setHasPdbValidation]);

    React.useEffect(() => {
        if (hasPdbValidation === values.undefined) checkPdb();
    }, [hasPdbValidation, checkPdb]);

    const hasPdbRedoValidations = hasPdbValidation === values.true;

    const pdbValidations = React.useMemo(() => {
        return hasPdbRedoValidations ? [buildPdbRedoValidation(pdb.id)] : [];
    }, [hasPdbRedoValidations, pdb.id]);

    return pdbValidations;
}
