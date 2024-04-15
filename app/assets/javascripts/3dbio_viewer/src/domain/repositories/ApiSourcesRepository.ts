import { Codec, GetType, string } from "purify-ts";
import { FutureData } from "../../domain/entities/FutureData";
import { Source } from "../../domain/entities/Source";
import { SourcesRepository } from "../../domain/repositories/SourcesRepository";
import { routes } from "../../routes";
import { getValidatedJSON } from "../../data/request-utils";
import { Pagination, getResults, paginationCodec } from "../../data/codec-utils";

export class ApiSourcesRepository implements SourcesRepository {
    get(): FutureData<Source[]> {
        const { bionotesStaging: api } = routes;

        const nmr$ = getValidatedJSON<Pagination<NmrMethod>>(
            `${api}/bws/api/nmr/source/`,
            paginationCodec(nmrMethodCodec)
        ).map(getResults);

        return nmr$.map(nmr => {
            // Manually adding NMR
            // BWS should be grouped in only one endpoint for all sources, and grouping even methods
            const nmrSource: Source = {
                name: "NMR",
                description: "The COVID19-NMR Consortium",
                externalLink: "https://covid19-nmr.de/",
                methods: nmr,
            };

            return [nmrSource];
        });
    }
}

const nmrMethodCodec = Codec.interface({
    name: string,
    description: string,
    externalLink: string,
});

type NmrMethod = GetType<typeof nmrMethodCodec>;
