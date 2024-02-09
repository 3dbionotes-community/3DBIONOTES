import _ from "lodash";
import JSZip from "jszip";
import { FutureData, fromPromise } from "../../domain/entities/FutureData";
import { AnnotationsExportRepository } from "../../domain/repositories/AnnotationsExportRepository";
import { Emdb } from "../../domain/entities/Pdb";
import { Track } from "../../domain/entities/Track";
import { getBioAnnotationsFromTracks } from "../BionotesAnnotations";
import { downloadBlob, downloadFile } from "../../utils/download";
import { Future } from "../../utils/future";
import { routes } from "../../routes";
import { getJSON } from "../request-utils";

//Use of "any", due to TS not recognizing Blob as a cross-blob type
declare const Blob: any;

export interface AnnotationsFile {
    blob: Blob;
    filename: string;
}

export class AnnotationsExportApiRepository implements AnnotationsExportRepository {
    exportAnnotations(blockId: string, tracks: Track[], chain: string): void {
        const bioAnnotations = getBioAnnotationsFromTracks(tracks, chain);
        return downloadFile({
            filename: blockId,
            data: JSON.stringify(bioAnnotations, null, 4),
            mimeType: "application/json",
        });
    }

    exportAllAnnotations(props: {
        proteinId: string;
        pdbId: string;
        chainId: string;
        emdbs: Emdb[];
    }): FutureData<void> {
        const { proteinId, pdbId, chainId, emdbs } = props;
        const { bionotes: bioUrl, bionotesStaging: bioUrlDev, ebi: ebiBaseUrl } = routes;
        const ebiProteinsApiUrl = `${ebiBaseUrl}/proteins/api`;

        //prettier-ignore
        const nameUrls = ([
            [`uniprotkb-${proteinId}`, `${routes.uniprot}/uniprotkb/${proteinId}`],
            [`proteins-features-${proteinId}`, `${ebiProteinsApiUrl}/features/${proteinId}`],
            [`proteins-variation-${proteinId}`, `${ebiProteinsApiUrl}/variation/${proteinId}`],
            [`proteins-proteomics-${proteinId}`, `${ebiProteinsApiUrl}/proteomics/${proteinId}`],
            [`proteins-antigenic-${proteinId}`, `${ebiProteinsApiUrl}/antigen/${proteinId}`],
            [`pdb-experiment-${pdbId}`, `${ebiBaseUrl}/pdbe/api/pdb/entry/experiment/${pdbId}`],
            [`pdb-publications-${pdbId}`, `${ebiBaseUrl}/pdbe/api/pdb/entry/publications/${pdbId}`],
            [`cv19-annotations-${proteinId}`, `${bioUrl}/cv19-annotations/${proteinId}-annotations.json`],
            [`pdb-annotations-${pdbId}-${chainId}`,`${bioUrl}/ws/lrs/pdbAnnotFromMap/all/${pdbId}/${chainId}/?format=json`],
            [`coverage-${pdbId}-${chainId}`, `${bioUrl}/api/alignments/Coverage/${pdbId}${chainId}`],
            [`mobi-uniprot-${proteinId}`, `${bioUrl}/api/annotations/mobi/Uniprot/${proteinId}`],
            [`phosphosite-uniprot-${proteinId}`, `${bioUrl}/api/annotations/Phosphosite/Uniprot/${proteinId}`],
            [`dbptm-uniprot-${proteinId}`, `${bioUrl}/api/annotations/dbptm/Uniprot/${proteinId}`],
            [`pfam-uniprot-${proteinId}`, `${bioUrl}/api/annotations/Pfam/Uniprot/${proteinId}`],
            [`smart-uniprot-${proteinId}`, `${bioUrl}/api/annotations/SMART/Uniprot/${proteinId}`],
            [`interpro-uniprot-${proteinId}`, `${bioUrl}/api/annotations/interpro/Uniprot/${proteinId}`],
            [`iedb-uniprot-${proteinId}`, `${bioUrl}/api/annotations/IEDB/Uniprot/${proteinId}`],
            [`elmdb-uniprot-${proteinId}`, `${bioUrl}/api/annotations/elmdb/Uniprot/${proteinId}`],
            [`mutagenesis-uniprot-${proteinId}`, `${bioUrl}/api/annotations/biomuta/Uniprot/${proteinId}`],
            [`pdb-redo-${pdbId}`, `${bioUrl}/api/annotations/PDB-REDO/${pdbId}`],
            [`molprobity-${pdbId}`, `${bioUrl}/compute/molprobity/${pdbId}`],
            [`ligands-${pdbId}`, `${bioUrlDev}/bws/api/pdbentry/${pdbId}/ligands/`],
        ] as const).map(([filename, url]) => [filename, getJSON(url)]);

        //prettier-ignore
        const emvNameUrls = emdbs?.map(({ id }) => ([
            [`emv-${id}-localresolution-consensus`, `${bioUrlDev}/bws/api/emv/${id}/localresolution/consensus/`],
            [`emv-${id}-localresolution-rank`, `${bioUrlDev}/bws/api/emv/${id}/localresolution/rank/`],
        ] as const)).flat().map(([filename, url]) => [filename, getJSON(url)]);

        //prettier-ignore
        const data$: { [x in string]: FutureData<unknown> } = {
            ..._.fromPairs(emvNameUrls),
            ..._.fromPairs(nameUrls)
        };

        return Future.joinObj(data$).flatMap(data => {
            const pairs = _.toPairs(data).map(([key, value]) => {
                if (_.isEmpty(value)) return;
                return {
                    blob: new Blob([JSON.stringify(value, null, 4)], {
                        type: "application/json",
                    }),
                    filename: key + ".json",
                };
            });

            if (pairs.every(pair => pair === undefined))
                return Future.error({ message: "No data available to download" });

            return this.generateZip(_.compact(pairs)).map(zipBlob =>
                downloadBlob({ blob: zipBlob, filename: "protvista-data.zip" })
            );
        });
    }

    private generateZip(files: AnnotationsFile[]): FutureData<Blob> {
        const zip = new JSZip();
        files.forEach(file => zip.file(file.filename, file.blob));
        return fromPromise(zip.generateAsync({ type: "blob" }));
    }
}
