import React from "react";
import _ from "lodash";
import { renderToString } from "react-dom/server";
import { Pdb } from "../../../domain/entities/Pdb";
import { debugVariable } from "../../../utils/debug";
import { useAppContext } from "../AppContext";
import { PdbView, ProtvistaTrackElement } from "./Protvista.types";
import styles from "./Protvista.module.css";
import { Tooltip } from "./Tooltip";

export const Protvista: React.FC = () => {
    const protvistaElRef = React.useRef<ProtvistaTrackElement>(null);
    const protvistaElRef2 = React.useRef<ProtvistaTrackElement>(null);
    const { compositionRoot } = useAppContext();

    React.useEffect(() => {
        const protvistaEl = protvistaElRef.current;
        const protvistaEl2 = protvistaElRef2.current;
        if (!protvistaEl || !protvistaEl2) return;

        //const pdbOptions = { protein: "Q9BYF1", pdb: "6lzg", chain: "A" };
        const pdbOptions = { protein: "P0DTC2", pdb: "6zow", chain: "A" };
        compositionRoot.getPdb(pdbOptions).run(
            pdb => {
                debugVariable(pdb);
                const [tracks1, tracks2] = _.partition(
                    pdb.tracks,
                    track => track.id !== "em-validation"
                );

                loadPdb(protvistaEl, { ...pdb, tracks: tracks1 });
                loadPdb(protvistaEl2, { ...pdb, tracks: tracks2, variants: undefined });
            },
            error => console.error(error)
        );
    });

    return (
        <div>
            <div className="section">
                <div className={styles.title}>
                    S | Spike protein S | Spike glycoprotein | Surface Glycoprotein | SPIKE_WCPV
                    <div className={styles.actions}>
                        <button>Tools</button>
                        <button>Profiles</button>
                        <button>?</button>
                    </div>
                </div>

                <div className="contents">
                    Spike protein, trimeric complex S1-S2-S2': Attaches the virion to the cell
                    membrane by interacting with host receptor, initiating the infection. Binding to
                    human ACE2 receptor and internalization of the virus into the endosomes of the
                    host cell induces conformational changes in the Spike glycoprotein. Uses also
                    human TMPRSS2 for priming in human lung cells which is an essential step for
                    viral entry. Proteolysis by cathepsin CTSL may unmask the fusion peptide of S2
                    and activate membranes fusion within endosomes.
                </div>
            </div>

            <protvista-pdb custom-data="true" ref={protvistaElRef}></protvista-pdb>

            <div className="section">
                <div className={styles.title}>
                    Map Validation<button>?</button>
                </div>
                <div className="contents">
                    The merge function allows the user to merge multiple .po files into a single
                    file. During the process of merging that application will validate that the
                    table, language, and column for the PO files are the same. If they are not then
                    an error will be returned. The action here is to take unique rowId entries from
                    each file and merge them to a single file.
                </div>
            </div>

            <protvista-pdb custom-data="true" ref={protvistaElRef2}></protvista-pdb>
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
        variants: pdb.variants
            ? {
                  ...pdb.variants,
                  variants: pdb.variants.variants.map(variant => ({
                      ...variant,
                      tooltipContent: variant.description,
                  })),
              }
            : undefined,
    };
}

function loadPdb(protvistaEl: ProtvistaTrackElement, pdb: Pdb, options: Partial<PdbView> = {}) {
    const pdbView = getPdbView(pdb);
    protvistaEl.viewerdata = { ...pdbView, ...options };

    protvistaEl.layoutHelper.hideSubtracks(0);

    protvistaEl.querySelectorAll(`.expanded`).forEach(trackSection => {
        trackSection.classList.remove("expanded");
    });
}
