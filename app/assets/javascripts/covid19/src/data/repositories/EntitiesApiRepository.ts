import _ from "lodash";
import { routes } from "../../routes";
import { getValidatedJSON } from "../utils/request-utils";
import { FutureData } from "../../domain/entities/FutureData";
import { NSPTarget } from "../../domain/entities/Covid19Info";
import { NMRPagination, EntitiesRepository } from "../../domain/repositories/EntitiesRepository";
import { nmrFragmentCodec, NMRScreeningFragment } from "../NMRScreening";
import { getResults, Pagination, paginationCodec } from "../codec-utils";
import { Future } from "../utils/future";
import i18n from "../../utils/i18n";

export class EntitiesApiRepository implements EntitiesRepository {
    getPartialNMRTarget(
        uniprotId: string,
        start: number,
        end: number,
        pagination: NMRPagination
    ): FutureData<{ target: NSPTarget; pagination: NMRPagination }> {
        const { bionotesApi } = routes;
        const nmrTarget$ = getValidatedJSON<Pagination<NMRScreeningFragment>>(
            `${bionotesApi}/nmr/${uniprotId}?start=${start}&end=${end}&limit=${pagination.pageSize}&page=${pagination.page}`,
            paginationCodec(nmrFragmentCodec)
        ).flatMap(p =>
            getNMRTarget(getResults(p)).map(target => ({
                pagination: p ? { ...pagination, count: p.count } : pagination,
                target,
            }))
        );

        return nmrTarget$;
    }

    getNMRTarget(uniprotId: string, start: number, end: number): FutureData<NSPTarget> {
        const { bionotesApi } = routes;
        const chunkSize = 50;
        const targetChunk$ = (page: number) =>
            getValidatedJSON<Pagination<NMRScreeningFragment>>(
                `${bionotesApi}/nmr/${uniprotId}?start=${start}&end=${end}&limit=${chunkSize}&page=${
                    page + 1
                }`,
                paginationCodec(nmrFragmentCodec)
            ).flatMap(pagination => getNMRTarget(getResults(pagination)));

        const nmrTarget$ = getValidatedJSON<Pagination<NMRScreeningFragment>>(
            `${bionotesApi}/nmr/${uniprotId}?start=${start}&end=${end}&limit=1`,
            paginationCodec(nmrFragmentCodec)
        )
            .flatMap(pagination => {
                const pages = Math.ceil(pagination?.count ?? 0 / chunkSize);
                return Future.sequential(_.times(pages).map(page => targetChunk$(page)));
            })
            .map(targets =>
                targets.reduce((acc, v) => ({
                    ...acc,
                    bindingCount: acc.bindingCount + v.bindingCount,
                    notBindingCount: acc.notBindingCount + v.notBindingCount,
                    fragments: [...acc.fragments, ...v.fragments],
                }))
            );

        return nmrTarget$;
    }
}

export function getNMRTarget(nmrScreenings: NMRScreeningFragment[]): FutureData<NSPTarget> {
    const fragments = nmrScreenings.map(nmr => ({
        ...nmr,
        binding: !nmr.details.type.toLowerCase().includes("not"),
    }));

    const targets = _(fragments)
        .groupBy(i => i.details.entity)
        .toPairs()
        .value();

    const target = targets[0];
    if (!target) return Future.error({ message: i18n.t("NMR Error: no target found") });
    if (targets.length > 1)
        return Future.error({
            message: i18n.t(
                `NMR Error: target should only be one. Instead received ${targets.length}.`
            ),
        });

    const [targetName, targetFragments] = target;

    const tFragments = targetFragments.map(
        ({ name, description, externalLink, binding, ligandentity, start, end }) => ({
            name,
            description,
            externalLink,
            binding,
            ligand: {
                ...ligandentity,
                inChI: ligandentity.IUPACInChIkey,
                smiles: ligandentity.canonicalSMILES,
                pubchemId: ligandentity.pubChemCompoundId,
            },
            start,
            end,
        })
    );

    const start = _.first(fragments.map(({ start }) => start));
    const end = _.first(fragments.map(({ end }) => end));
    if (!start || !end)
        return Future.error({
            message: i18n.t(
                "NMR Unexpected Error: no start / no end on fragments. Unable to get target."
            ),
        });

    return Future.success({
        name: targetName,
        fragments: tFragments,
        bindingCount: fragments.filter(({ binding }) => binding).length,
        notBindingCount: fragments.filter(({ binding }) => !binding).length,
        start,
        end,
    });
}
