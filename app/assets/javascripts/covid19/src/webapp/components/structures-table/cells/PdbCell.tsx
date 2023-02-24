import React from "react";
import _ from "lodash";
import styled from "styled-components";
import { ClickAwayListener, Grid } from "@material-ui/core";
import {
    getTranslations,
    getValidationSource,
    Pdb,
    PdbValidation,
    Structure,
    ValidationSource,
} from "../../../../domain/entities/Covid19Info";
import { HtmlTooltip } from "../HtmlTooltip";
import { CellProps } from "../Columns";
import { Thumbnail } from "../Thumbnail";
import { BadgeLink } from "../badge/BadgeLink";
import { Badge } from "../badge/Badge";
import i18n from "../../../../utils/i18n";

export const PdbCell: React.FC<CellProps> = React.memo(props => {
    const { pdb } = props.row;
    return pdb ? (
        <PdbCell2
            structure={props.row}
            pdb={pdb}
            validationSources={props.validationSources ?? []}
        />
    ) : null;
});

const PdbCell2: React.FC<{
    structure: Structure;
    pdb: Pdb;
    validationSources: ValidationSource[];
}> = React.memo(props => {
    const { pdb, structure, validationSources } = props;
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

    const handleTooltipClose = React.useCallback(() => {
        setOpen(false);
    }, []);

    const handleTooltipOpen = React.useCallback(() => {
        setOpen(true);
    }, []);

    return (
        <div>
            {pdb ? <Thumbnail type="pdb" value={pdb} tooltip={propertiesTooltip} /> : null}

            {!_.isEmpty(pdbValidations) ? (
                pdbValidations.length === 1 && pdbValidations[0] ? (
                    <Validation
                        pdbValidation={pdbValidations[0]}
                        validationSources={validationSources}
                    />
                ) : (
                    <Grid container justify="center">
                        <ClickAwayListener onClickAway={handleTooltipClose}>
                            <HtmlTooltip
                                onClose={handleTooltipClose}
                                open={open}
                                disableFocusListener
                                disableHoverListener
                                title={
                                    <ValidationTooltip
                                        pdbValidations={pdbValidations}
                                        validationSources={validationSources}
                                    />
                                }
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
        </div>
    );
});

const ValidationTooltip: React.FC<ValidationTooltipProps> = React.memo(
    ({ pdbValidations, validationSources }) => (
        <React.Fragment>
            {pdbValidations.map((pdbValidation, idx) => (
                <Validation
                    key={idx}
                    pdbValidation={pdbValidation}
                    validationSources={validationSources}
                />
            ))}
        </React.Fragment>
    )
);

const Validation: React.FC<ValidationProps> = React.memo(props => {
    const { pdbValidation, validationSources } = props;

    const translations = React.useMemo(getTranslations, []);

    const text = React.useMemo(() => {
        switch (pdbValidation?.source) {
            case "PDB-REDO":
                return translations.filterKeys.pdbRedo;
            case "CSTF":
                return translations.filterKeys.cstf;
            case "CERES":
                return translations.filterKeys.ceres;
        }
    }, [
        pdbValidation,
        translations.filterKeys.cstf,
        translations.filterKeys.pdbRedo,
        translations.filterKeys.ceres,
    ]);

    const source = React.useMemo(
        () => getValidationSource(validationSources, pdbValidation.source),
        [pdbValidation.source, validationSources]
    );

    const method = React.useMemo(() => source?.methods.find(m => m.name === pdbValidation.method), [
        pdbValidation.method,
        source?.methods,
    ]);

    return (
        <HtmlTooltip
            title={
                <div>
                    {method && (
                        <>
                            <strong>{i18n.t("Method: ", { nsSeparator: false })}</strong>
                            <span>{method.description}</span>
                        </>
                    )}
                    <br />
                    <br />
                    {source && (
                        <>
                            <strong>{i18n.t("Source: ", { nsSeparator: false })}</strong>
                            <span>{source.description}</span>
                        </>
                    )}
                </div>
            }
        >
            <GroupBadges key={pdbValidation.method}>
                {pdbValidation.externalLink && pdbValidation.queryLink ? (
                    <>
                        <BadgeLink
                            style={styles.grow}
                            key={pdbValidation.method + "-external"}
                            url={pdbValidation.externalLink}
                            text={text}
                            icon="external"
                            backgroundColor={pdbValidation.badgeColor}
                        />
                        <BadgeLink
                            key={pdbValidation.method + "-viewer"}
                            url={pdbValidation.queryLink}
                            icon="viewer"
                            backgroundColor={pdbValidation.badgeColor}
                        />
                    </>
                ) : (
                    <BadgeLink
                        key={pdbValidation.method + "-external"}
                        url={
                            pdbValidation.queryLink
                                ? pdbValidation.queryLink
                                : pdbValidation.externalLink
                        }
                        text={text}
                        icon={pdbValidation.queryLink ? "viewer" : "external"}
                        backgroundColor={pdbValidation.badgeColor}
                    />
                )}
            </GroupBadges>
        </HtmlTooltip>
    );
});

interface ValidationProps {
    pdbValidation: PdbValidation;
    validationSources: ValidationSource[];
}

interface ValidationTooltipProps {
    pdbValidations: PdbValidation[];
    validationSources: ValidationSource[];
}

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
