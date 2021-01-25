import _ from "lodash";
import { Fragment, getFragment } from "../../../../domain/entities/Fragment";
import { Track, addToTrack, Subtrack } from "../../../../domain/entities/Track";
import i18n from "../../../../webapp/utils/i18n";
import { config } from "../config";

export interface MobiUniprot {
    disorder: MobiUniprotItem;
    lips: MobiUniprotItem;
}

export interface MobiUniprotItem {
    [key: string]: Array<{
        start: number;
        end: number;
        method: string | null;
    }>;
}

export function addMobiSubtracks(tracks: Track[], mobiUniprot: MobiUniprot | undefined): Track[] {
    if (!mobiUniprot) return tracks;

    return addToTrack({
        tracks,
        trackInfo: { id: "domains-and-sites", label: "Domains & sites" },
        subtracks: getMobiUniprotSubtracks(mobiUniprot),
    });
}

function getMobiUniprotSubtracks(mobiUniprot: MobiUniprot | undefined): Subtrack[] {
    if (!mobiUniprot) return [];

    const fragments = _(mobiUniprot.lips)
        .values()
        .flatten()
        .map(
            (obj): Fragment => ({
                start: obj.start,
                end: obj.end,
                description: "TODO",
                color: "#cc2060", // TODO: Missing in config
            })
        )
        .value();

    const subtrack: Subtrack = {
        type: "LINEAR_INTERACTING_PEPTIDE",
        accession: "LIPS",
        shape: "rectangle",
        locations: [{ fragments }],
        label: "Linear interacting peptide",
    };

    return [subtrack];
}

export function getMobiDisorderTrack(mobiUniprot: MobiUniprot | undefined): Track | undefined {
    if (!mobiUniprot || !mobiUniprot.disorder) return;
    const annotations = _.flatten(_.values(mobiUniprot.disorder));

    return {
        id: "disordered-regions",
        label: "Disordered regions",
        subtracks: [
            {
                accession: "inferred",
                type: "Inferred",
                label: "Inferred",
                shape: "rectangle",
                locations: [
                    {
                        fragments: _.flatMap(annotations, an =>
                            getFragment({
                                start: an.start,
                                end: an.end,
                                description:
                                    i18n.t("Inferred from") + " " + (an.method || "Unknown"),
                                color: an.method ? config.colorByTrackName.inferred : "#557071",
                            })
                        ),
                    },
                ],
            },
        ],
    };
}
