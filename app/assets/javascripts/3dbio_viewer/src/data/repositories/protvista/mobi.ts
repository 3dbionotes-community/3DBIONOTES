import _ from "lodash";
import { Fragment } from "../../../domain/entities/Fragment";
import { Track, addToTrack, Subtrack } from "../../../domain/entities/Track";
import { MobiUniprot } from "./PdbRepositoryNetwork.types";

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
