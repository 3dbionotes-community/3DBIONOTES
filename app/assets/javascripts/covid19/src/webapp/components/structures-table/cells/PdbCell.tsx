import React from "react";
import _ from "lodash";
import styled from "styled-components";
import { ClickAwayListener, Grid } from "@material-ui/core";
import { HtmlTooltip } from "../HtmlTooltip";
import { CellProps } from "../Columns";
import { Thumbnail } from "../Thumbnail";
import { BadgeLink } from "../BadgeLink";
import { Pdb, Structure } from "../../../../domain/entities/Covid19Info";
import i18n from "../../../../utils/i18n";
import { Badge } from "../Badge";
import { BadgeButton } from "../BadgeDetails";

export const PdbCell: React.FC<CellProps> = React.memo(props => {
    const { pdb } = props.row;
    return pdb ? <PdbCell2 structure={props.row} pdb={pdb} /> : null;
});

const PdbCell2: React.FC<{ structure: Structure; pdb: Pdb }> = React.memo(props => {
    const { pdb, structure } = props;
    const [open, setOpen] = React.useState(false);

    const pdbValidations = structure.validations.pdb;

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
            {pdbValidations.map(pdbValidation => {
                switch (pdbValidation?.type) {
                    case "pdbRedo":
                        return (
                            <GroupBadges key="pdb-redo">
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
                                    icon="viewer"
                                    color={pdbValidation.badgeColor}
                                />
                            </GroupBadges>
                        );
                    case "isolde":
                        return (
                            <BadgeLink
                                key="pdb-isolde-viewer"
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
                            <BadgeButton onClick={handleTooltipOpen}>
                                {i18n.t("Show validations")}
                            </BadgeButton>
                        </HtmlTooltip>
                    </ClickAwayListener>
                </Grid>
            ) : null}
        </React.Fragment>
    );
});

const GroupBadges = styled.div`
    display: flex;
    justify-content: center;
`;
