import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { BadgeLigands, OnClickIDR } from "../badge/BadgeLigands";
import { CellProps, styles } from "../Columns";
import { Link } from "../Link";
import { Wrapper } from "./Wrapper";
import { getValidationSource } from "../../../../domain/entities/Covid19Info";
import { HtmlTooltip } from "../HtmlTooltip";
import i18n from "../../../../utils/i18n";
import { useAppContext } from "../../../contexts/app-context";

export interface LigandsCellProps extends CellProps {
    onClickIDR?: OnClickIDR;
}

export const LigandsCell: React.FC<LigandsCellProps> = React.memo(props => {
    const { row, onClickDetails, onClickIDR, moreDetails = true } = props;
    const { sources: validationSources } = useAppContext();

    const ligands = React.useMemo(() => {
        return row.ligands.map(ligand => {
            return {
                ...ligand,
                url: ligand.externalLink,
                tooltip: (
                    <React.Fragment>
                        <div>
                            {i18n.t("ID")}: {ligand.id}
                        </div>
                        <div>
                            {i18n.t("Name")}: {ligand.name}
                        </div>

                        {ligand.imageLink && (
                            <img alt={ligand.id} src={ligand.imageLink} style={styles.image} />
                        )}
                    </React.Fragment>
                ),
            };
        });
    }, [row.ligands]);

    const idrValidationSource = React.useMemo(
        () => getValidationSource(validationSources ?? [], "IDR"),
        [validationSources]
    );

    const idrTooltip = React.useMemo(
        () =>
            idrValidationSource ? (
                <div>
                    {idrValidationSource.methods.map(method => (
                        <>
                            {idrValidationSource.methods.length > 1 ? (
                                <strong>
                                    {i18n.t(`{{methodName}} Method: `, {
                                        nsSeparator: false,
                                        methodName: method.name,
                                    })}
                                </strong>
                            ) : (
                                <strong>{i18n.t("Method: ", { nsSeparator: false })}</strong>
                            )}
                            <span>{method.description}</span>
                            <br />
                            <br />
                        </>
                    ))}
                    {idrValidationSource.description && (
                        <>
                            <strong>{i18n.t("Source: ", { nsSeparator: false })}</strong>
                            <span>{idrValidationSource.description}</span>
                        </>
                    )}
                </div>
            ) : undefined,
        [idrValidationSource]
    );

    return (
        <Wrapper
            onClickDetails={onClickDetails}
            moreDetails={moreDetails}
            row={row}
            field="ligands"
        >
            {_(ligands)
                .sortBy(ligand => (ligand.hasIDR ? 0 : 1))
                .map(ligand => {
                    return (
                        <LigandItem key={ligand.id} moreDetails={moreDetails}>
                            <Link
                                tooltip={ligand.tooltip}
                                url={ligand.url}
                                text={`${ligand.name} (${ligand.id})`}
                            />
                            {ligand.hasIDR && row.pdb?.id && idrTooltip && (
                                <HtmlTooltip title={idrTooltip}>
                                    <span>
                                        <BadgeLigands
                                            pdbId={row.pdb.id}
                                            ligand={ligand}
                                            onClick={onClickIDR}
                                            moreDetails={moreDetails}
                                        />
                                    </span>
                                </HtmlTooltip>
                            )}
                        </LigandItem>
                    );
                })
                .value()}
        </Wrapper>
    );
});

const LigandItem = styled.div<{ moreDetails?: boolean }>`
    ${props => (props.moreDetails ? "" : "display: flex; align-items: center;")}
    li {
        text-align: left;
    }
    p {
        margin-top: 0;
        text-align: left;
        display: ${props => (props.moreDetails ? "inherit" : "inline-flex")};
        margin-right: ${props => (props.moreDetails ? "0" : "0.5em")};
    }
`;
