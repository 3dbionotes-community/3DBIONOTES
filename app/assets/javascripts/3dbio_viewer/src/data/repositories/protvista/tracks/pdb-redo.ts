import _ from "lodash";
import { Chain } from "../../../../domain/entities/Chain";
import { getFragment } from "../../../../domain/entities/Fragment";
import { Subtrack, Track } from "../../../../domain/entities/Track";
import i18n from "../../../../webapp/utils/i18n";
import { getColorFromString, getShapeFromString, getTrack } from "../config";
import { getId, getName } from "../utils";

export type PdbRedo = Record<Chain, PdbRedoFeature[]>;

interface PdbRedoFeature {
    begin: number;
    end: number;
    type: string;
    description: string;
    evidences: Record<string, { name: string; id: string; url: string }>;
}

export function getPdbRedoTrack(pdbRedo: PdbRedo, chain: Chain): Track | undefined {
    const features = pdbRedo[chain];
    if (!features) return;

    const featuresByType = _.groupBy(features, feature => feature.type);

    const subtracks = _.map(
        featuresByType,
        (featuresForType, type): Subtrack => {
            const track = getTrack(type);
            const name = track ? track.label : getName(type);

            return {
                accession: getId(type),
                type: track ? track.tooltip : getName(type),
                label: name,
                shape: getShapeFromString(type),
                locations: [
                    {
                        fragments: _.flatMap(featuresForType, feature =>
                            getFragment({
                                start: feature.begin,
                                end: feature.end,
                                description: getDescription(name, feature),
                                color: getColorFromString(type),
                            })
                        ),
                    },
                ],
            };
        }
    );

    return {
        id: "pdb-redo",
        label: "PDB-REDO",
        subtracks,
    };
}

function getDescription(name: string, feature: PdbRedoFeature): string {
    return [
        name + "  " + i18n.t("in PDB_REDO model"),
        ..._.map(feature.evidences).map(
            (evidence, type) => `${type}: ${evidence.name} - ${evidence.id} - ${evidence.url}`
        ),
    ].join("\n");
}
