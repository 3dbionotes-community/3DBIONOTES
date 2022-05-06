import React from "react";
import _ from "lodash";
import styled from "styled-components";
import { ClickAwayListener, Grid } from "@material-ui/core";
import {
    getTranslations,
    Pdb,
    PdbValidation,
    Structure,
} from "../../../../domain/entities/Covid19Info";
import { useAppContext } from "../../../contexts/app-context";
import { HtmlTooltip } from "../HtmlTooltip";
import { CellProps } from "../Columns";
import { Thumbnail } from "../Thumbnail";
import { BadgeLink } from "../badge/BadgeLink";
import { Badge } from "../badge/Badge";
import i18n from "../../../../utils/i18n";
import { Link } from "../Link";

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
                pdbValidations.length === 1 && pdbValidations[0] ? (
                    <Validation pdbValidation={pdbValidations[0]} />
                ) : (
                    <Grid container justify="center">
                        <ClickAwayListener onClickAway={handleTooltipClose}>
                            <HtmlTooltip
                                onClose={handleTooltipClose}
                                open={open}
                                disableFocusListener
                                disableHoverListener
                                title={<ValidationTooltip pdbValidations={pdbValidations} />}
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

const ValidationTooltip: React.FC<ValidationTooltipProps> = React.memo(({ pdbValidations }) => (
    <React.Fragment>
        {pdbValidations.map((pdbValidation, idx) => (
            <Validation key={idx} pdbValidation={pdbValidation} />
        ))}
    </React.Fragment>
));

const Validation: React.FC<ValidationProps> = React.memo(props => {
    const { pdbValidation } = props;
    const { compositionRoot } = useAppContext();

    const translations = React.useMemo(getTranslations, []);

    const text = React.useMemo(() => {
        switch (pdbValidation?.source) {
            case "PDB-REDO":
                return translations.filterKeys.pdbRedo;
            case "CSTF":
                return translations.filterKeys.cstf;
            case "Phenix":
                return translations.filterKeys.phenix;
        }
    }, [
        pdbValidation,
        translations.filterKeys.cstf,
        translations.filterKeys.pdbRedo,
        translations.filterKeys.phenix,
    ]);

    const source = React.useMemo(
        () => compositionRoot.getValidationSource.execute(pdbValidation.source),
        [compositionRoot.getValidationSource, pdbValidation.source]
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
                    <br />
                    <br />
                    {source && (
                        <>
                            <strong>{i18n.t("Ref: ", { nsSeparator: false })}</strong>
                            <Link url={source.externalLink}>{source.name}</Link>
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
                        style={styles.grow}
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
}

interface ValidationTooltipProps {
    pdbValidations: PdbValidation[];
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
