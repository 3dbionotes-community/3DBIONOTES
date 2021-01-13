import React from "react";
import _ from "lodash";
import { renderToString } from "react-dom/server";
import { Pdb } from "../../../domain/entities/Pdb";
import { debugVariable } from "../../../utils/debug";
import { useAppContext } from "../AppContext";
import { PdbView, ProtvistaTrackElement } from "./Protvista.types";
import styles from "./Protvista.module.css";
import { Tooltip } from "./Tooltip";

type State =
    | { type: "loading" }
    | { type: "loaded"; refs: Array<React.RefObject<ProtvistaTrackElement>> };

export const Protvista: React.FC = () => {
    const protvistaElRef1 = React.useRef<ProtvistaTrackElement>(null);
    const protvistaElRef2 = React.useRef<ProtvistaTrackElement>(null);
    const { compositionRoot } = useAppContext();
    const [state, setState] = React.useState<State>({ type: "loading" });

    React.useEffect(() => {
        const pdbOptions = {
            pdb6zow: { protein: "P0DTC2", pdb: "6zow", chain: "A" },
            pdb6lzg: { protein: "Q9BYF1", pdb: "6lzg", chain: "A" },
        };

        return compositionRoot.getPdb(pdbOptions.pdb6zow).run(
            pdb => {
                setState({ type: "loading" });
                debugVariable(pdb);
                const [tracks1, tracks2] = _.partition(
                    pdb.tracks,
                    track => track.id !== "em-validation"
                );

                const refs = [
                    loadPdb(protvistaElRef1, { ...pdb, tracks: tracks1 }),
                    loadPdb(protvistaElRef2, { ...pdb, tracks: tracks2, variants: undefined }),
                ];
                setState({ type: "loaded", refs: _.compact(refs) });
            },
            error => console.error(error)
        );
    }, [compositionRoot, protvistaElRef1, protvistaElRef2, setState]);

    return (
        <div>
            <div className="section" style={getSectionStyle(state, protvistaElRef1)}>
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
                <protvista-pdb custom-data="true" ref={protvistaElRef1}></protvista-pdb>
            </div>

            <div className="section" style={getSectionStyle(state, protvistaElRef2)}>
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
                <protvista-pdb custom-data="true" ref={protvistaElRef2}></protvista-pdb>
            </div>
        </div>
    );
};

function getSectionStyle(
    state: State,
    ref: React.RefObject<ProtvistaTrackElement>
): React.CSSProperties {
    return {
        //opacity: state.type !== "loaded" || !state.refs.includes(ref) ? 0 : 1,
    };
}

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

function loadPdb(
    protvistaRef: React.RefObject<ProtvistaTrackElement>,
    pdb: Pdb,
    options: Partial<PdbView> = {}
): React.RefObject<ProtvistaTrackElement> | undefined {
    const protvistaEl = protvistaRef.current;
    if (!protvistaEl || _(pdb.tracks).isEmpty()) return;

    const pdbView = getPdbView(pdb);
    protvistaEl.viewerdata = { ...pdbView, ...options };

    protvistaEl.layoutHelper.hideSubtracks(0);

    protvistaEl.querySelectorAll(`.expanded`).forEach(trackSection => {
        trackSection.classList.remove("expanded");
    });

    return protvistaRef;
}
