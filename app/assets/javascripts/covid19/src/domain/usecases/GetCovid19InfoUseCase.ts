import _ from "lodash";
import { Covid19InfoRepository, GetOptions } from "../repositories/Covid19InfoRepository";
import { StorageProvider } from "./common/StorageProvider";
import { FutureData } from "../entities/FutureData";
import { Covid19Info } from "../entities/Covid19Info";

export class GetCovid19InfoUseCase {
    constructor(
        private cacheProvider: StorageProvider,
        private covid19InfoRepository: Covid19InfoRepository
    ) {
        //we can have checksums. endpoint on bws with the most frequent queries with checksum already calculated and store on localStorage.
        //in constructor if checksum is not the same, reset key of that specific query
        //so for example once loaded first page, if first page is same checksum, should load almost instant
        //and also reset all keys as covid19Info_0_10_0_0_0_0_0_0_0_0_0_releaseDate_desc and covid19Info_query
    }

    execute(options: GetOptions): FutureData<Covid19Info> {
        //EARLY PROPOSAL

        //if options (and deep props) are exactly as in specificUseCases.firstPages by pageSize as key, get from cacheProvider.get1stPages
        // if (options.pageSize && _.isEqual(options,specificUseCases.firstPages[options.pageSize])) {
        //     return this.cacheProvider.get({
        //         key: `covid19Info_firstPages_${options.pageSize}`,
        //         getter: () => this.covid19InfoRepository.get(options),
        //     });
        // }

        //key could be the only condition and create default key setter for the filer for example
        //covid19Info_0_10_0_0_0_0_0_0_0_0_0_releaseDate_desc
        //covid19Info_query when query is present (only first page)
        return this.covid19InfoRepository.get(options);
    }
}

// const pageSizes = [10, 25, 50, 75, 100];

// const specificUseCases = {
//     firstPages: {
//         ...pageSizes.reduce<Record<typeof pageSizes[number], GetOptions>>(
//             (acc, v) => ({
//                 ...acc,
//                 [v]: {
//                     page: 0,
//                     pageSize: v,
//                     filter: {
//                         antibodies: false,
//                         nanobodies: false,
//                         sybodies: false,
//                         pdbRedo: false,
//                         cstf: false,
//                         ceres: false,
//                         idr: false,
//                     },
//                     sort: {
//                         field: "releaseDate",
//                         order: "desc",
//                     },
//                     query: undefined,
//                 },
//             }),
//             {}
//         ),
//     },
// };
