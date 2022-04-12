import React from "react";
import _ from "lodash";
import styled from "styled-components";
import { ClickAwayListener, Grid } from "@material-ui/core";
import { HtmlTooltip } from "../HtmlTooltip";
import { CellProps } from "../Columns";
import { Thumbnail } from "../Thumbnail";
import { BadgeLink } from "../badge/BadgeLink";
import {
    getTranslations,
    Pdb,
    PdbValidation,
    Structure,
} from "../../../../domain/entities/Covid19Info";
import { Badge } from "../badge/Badge";
import i18n from "../../../../utils/i18n";

export const PdbCell: React.FC<CellProps> = React.memo(props => {
    const { pdb } = props.row;
    return pdb ? <PdbCell2 structure={props.row} pdb={pdb} /> : null;
});

const PdbCell2: React.FC<{ structure: Structure; pdb: Pdb }> = React.memo(props => {
    const { pdb, structure } = props;
    const [open, setOpen] = React.useState(false);
    const pdbValidations = structure.validations.pdb;
    const translations = React.useMemo(getTranslations, []);

    const getValidation = React.useCallback(
        (pdbValidation: PdbValidation) => {
            switch (pdbValidation?.type) {
                case "pdbRedo":
                    return (
                        <GroupBadges key="pdb-redo">
                            <BadgeLink
                                key="pdb-redo-external"
                                url={pdbValidation.externalLink}
                                text={translations.filterKeys.pdbRedo}
                                icon="external"
                                backgroundColor={pdbValidation.badgeColor}
                            />
                            <BadgeLink
                                key="pdb-redo-viewer"
                                url={pdbValidation.queryLink}
                                icon="viewer"
                                backgroundColor={pdbValidation.badgeColor}
                            />
                        </GroupBadges>
                    );
                case "isolde":
                    return (
                        <GroupBadges key="isolde">
                            <BadgeLink
                                key="isolde-viewer"
                                url={pdbValidation.queryLink}
                                text={translations.filterKeys.isolde}
                                icon="viewer"
                                backgroundColor={pdbValidation.badgeColor}
                                style={styles.grow}
                            />
                        </GroupBadges>
                    );
                case "refmac":
                    return (
                        <GroupBadges key="refmac">
                            <BadgeLink
                                key="refmac-viewer"
                                url={pdbValidation.queryLink}
                                text={translations.filterKeys.refmac}
                                icon="viewer"
                                backgroundColor={pdbValidation.badgeColor}
                                style={styles.grow}
                            />
                        </GroupBadges>
                    );
                default:
                    throw new Error("Unsupported");
            }
        },
        [translations]
    );

    const propertiesTooltip = (
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

    const validationsTooltip = (
        <React.Fragment>
            {pdbValidations.map(pdbValidation => getValidation(pdbValidation))}
        </React.Fragment>
    );

    const handleTooltipClose = React.useCallback(() => {
        setOpen(false);
    }, []);

    const handleTooltipOpen = React.useCallback(() => {
        setOpen(true);
    }, []);

    return (
        <React.Fragment>
            {pdb ? <Thumbnail type="pdb" value={pdb} tooltip={propertiesTooltip} /> : null}

            {!_.isEmpty(pdbValidations) ? (
                pdbValidations.length === 1 ? (
                    getValidation(pdbValidations[0])
                ) : (
                    <Grid container justify="center">
                        <ClickAwayListener onClickAway={handleTooltipClose}>
                            <HtmlTooltip
                                onClose={handleTooltipClose}
                                open={open}
                                disableFocusListener
                                disableHoverListener
                                disableTouchListener
                                title={validationsTooltip}
                                placement="bottom"
                                arrow
                            >
                                <Badge onClick={handleTooltipOpen} backgroundColor={"w3-turq"}>
                                    {i18n.t("Show validations")}
                                </Badge>
                            </HtmlTooltip>
                        </ClickAwayListener>
                    </Grid>
                )
            ) : null}
        </React.Fragment>
    );
});

const styles = {
    grow: {
        display: "inline-flex",
        flexGrow: 1,
    },
};

const GroupBadges = styled.div`
    display: flex;
    justify-content: center;
`;
