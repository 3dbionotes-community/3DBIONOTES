import React from "react";
import { renderToString } from "react-dom/server";
import { Fragment } from "../../../domain/entities/Fragment";
import { Pdb } from "../../../domain/entities/Pdb";
import i18n from "../../utils/i18n";
import { useAppContext } from "../AppContext";
import { PdbView } from "./provista.types";

interface ProvistaTrackElement extends HTMLDivElement {
    viewerdata: PdbView;
}

export const Protvista: React.FC = () => {
    const protvistaElRef = React.useRef<ProvistaTrackElement>(null);
    const { compositionRoot } = useAppContext();

    React.useEffect(() => {
        const provistaEl = protvistaElRef.current;
        if (!provistaEl) return;

        compositionRoot.getPdb({ protein: "P0DTC2", pdb: "6zow", chain: "A" }).run(
            pdb => {
                //(provistaEl as any).variantFilter = protvistaConfig.variantsFilters;
                provistaEl.viewerdata = getPdbView(pdb);
            },
            error => {
                alert(error.message);
            }
        );
    });

    return (
        <div>
            <protvista-pdb custom-data="true" ref={protvistaElRef}></protvista-pdb>
        </div>
    );
};

function getPdbView(pdb: Pdb): PdbView {
    return {
        ...pdb,
        displayNavigation: true,
        displaySequence: true,
        displayConservation: false,
        displayVariants: true,
        tracks: pdb.tracks.map(track => ({
            ...track,
            data: track.data.map(dataItem => ({
                ...dataItem,
                locations: dataItem.locations.map(location => ({
                    ...location,
                    fragments: location.fragments.map(fragment => ({
                        ...fragment,
                        tooltipContent: renderToString(<Tooltip fragment={fragment} />),
                    })),
                })),
            })),
        })),
    };
}

const styles = {
    tooltip: {
        borderColor: "black",
        display: "inline-flex",
        width: 10,
        borderWidth: 1,
        height: 10,
        marginRight: 5,
    },
};

const Tooltip: React.FC<{ fragment: Fragment }> = ({ fragment }) => {
    return (
        <table>
            <tr>
                <td>{i18n.t("Description")}</td>
                <td>{fragment.description}</td>
            </tr>

            {fragment.legend && (
                <tr>
                    <td>{i18n.t("Legend")}</td>
                    <td>
                        {fragment.legend.map(legendItem => (
                            <React.Fragment>
                                <div
                                    style={{ ...styles.tooltip, backgroundColor: legendItem.color }}
                                ></div>
                                <span>{legendItem.text}</span>
                                <br />
                            </React.Fragment>
                        ))}
                    </td>
                </tr>
            )}
        </table>
    );
};
