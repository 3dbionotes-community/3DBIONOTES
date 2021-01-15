import _ from "lodash";
import { Track } from "../../domain/entities/Track";
import { Cv19Annotation } from "./PdbRepositoryNetwork.types";
import { getId, getName } from "./utils";

export function getFunctionalMappingTrack(mapping: Cv19Annotation | undefined) {
    const mappingTracks = mapping
        ? _(mapping.data)
              .groupBy(data => data.partner_name)
              .map((values, key) => ({ name: key, items: values }))
              .value()
        : [];

    const functionalMappingTrack: Track | undefined = mapping
        ? {
              id: getId(mapping.track_name),
              label: getName(mapping.track_name),
              subtracks: mappingTracks.map(track => ({
                  accession: getName(track.name),
                  type: track.items[0].type,
                  label: getName(track.name),
                  labelTooltip: track.items[0].description,
                  shape: "rectangle",
                  locations: [
                      {
                          fragments: track.items.map(item => ({
                              start: item.begin,
                              end: item.end,
                              description: item.description,
                              color: item.color,
                          })),
                      },
                  ],
              })),
          }
        : undefined;
    return functionalMappingTrack;
}
