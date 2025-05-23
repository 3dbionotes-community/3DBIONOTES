import { Codec, exactly, string } from "purify-ts";
import { FutureData } from "../../domain/entities/FutureData";
import { Source } from "../../domain/entities/Source";
import { SourcesRepository } from "../../domain/repositories/SourcesRepository";
import { routes } from "../../routes";
import { getResults, paginationCodec } from "../codec-utils";
import { Future } from "../utils/future";
import { getValidatedJSON } from "../utils/request-utils";

export class SourcesApiRepository implements SourcesRepository {
    get(): FutureData<Source[]> {
        const { bionotesApi } = routes;

        const refinedModelSources$ = getValidatedJSON(
            `${bionotesApi}/refinedModelSources/`,
            paginationCodec(modelSourcesCodec)
        ).map(getResults);

        const refinedModelMethods$ = getValidatedJSON(
            `${bionotesApi}/refinedModelMethods/`,
            paginationCodec(modelMethodsCodec)
        ).map(getResults);

        const nmr$ = getValidatedJSON(
            `${bionotesApi}/nmr/source/`,
            paginationCodec(nmrMethodCodec)
        ).map(getResults);

        return Future.joinObj({
            refinedModelSources: refinedModelSources$,
            refinedModelMethods: refinedModelMethods$,
            nmr: nmr$,
        }).map(({ refinedModelSources, refinedModelMethods, nmr }) => {
            // Manually adding NMR and IDR sources
            // BWS should be grouped in only one endpoint for all sources, and grouping even methods
            const nmrSource: Source = {
                name: "NMR",
                description: "The COVID19-NMR Consortium",
                externalLink: "https://covid19-nmr.de/",
                methods: nmr,
            };

            const refinedSources = refinedModelSources.map(source => ({
                ...source,
                methods: refinedModelMethods.filter(method => method.source === source.name),
            }));

            return [...refinedSources, idrSource, nmrSource];
        });
    }
}

const refinedSources = ["CERES", "CSTF", "PDB-REDO"] as const;

const modelSourcesCodec = Codec.interface({
    name: exactly(...refinedSources),
    description: string,
    externalLink: string,
});

const modelMethodsCodec = Codec.interface({
    source: exactly(...refinedSources),
    name: string,
    description: string,
    externalLink: string,
});

const nmrMethodCodec = Codec.interface({
    name: string,
    description: string,
    externalLink: string,
});

const idrSource: Source = {
    name: "IDR",
    description:
        "The Image Data Resource (IDR) is a public repository of image datasets from published scientific studies, where the community can submit, search and access high-quality bio-image data.",
    externalLink: "https://idr.openmicroscopy.org/",
    methods: [
        {
            name: "IDR",
            description:
                "High throughput sample analysis of collections of compounds that provide a variety of chemically diverse structures that can be used to identify structure types that have affinity with pharmacological targets. (Source Accession: EFO_0007553)",
            externalLink: "https://idr.openmicroscopy.org/",
        },
    ],
};
