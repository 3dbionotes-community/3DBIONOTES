import _, { pick } from "lodash";
import { routes } from "../../routes";
import { getValidatedJSON } from "../utils/request-utils";
import { FutureData } from "../../domain/entities/FutureData";
import { BasicNSPTarget, NSPTarget } from "../../domain/entities/Covid19Info";
import { NMRPagination, EntitiesRepository } from "../../domain/repositories/EntitiesRepository";
import { nmrFragmentCodec, NMRScreeningFragment } from "../NMRScreening";
import { getResults, Pagination, paginationCodec } from "../codec-utils";
import { Future } from "../utils/future";
import { lookup } from "mime-types";
import FileSaver from "file-saver";
import i18n from "../../utils/i18n";

export class EntitiesApiRepository implements EntitiesRepository {
    getPartialNMRTarget(
        target: BasicNSPTarget,
        pagination: NMRPagination
    ): FutureData<{ target: NSPTarget; pagination: NMRPagination }> {
        const { uniprotId, start, end } = target;
        const { bionotesApi } = routes;
        const nmrTarget$ = getValidatedJSON<Pagination<NMRScreeningFragment>>(
            `${bionotesApi}/nmr/${uniprotId}?start=${start}&end=${end}&limit=${
                pagination.pageSize
            }&page=${pagination.page + 1}`,
            paginationCodec(nmrFragmentCodec)
        ).flatMap(p =>
            getNMRTarget(uniprotId, getResults(p)).map(target => ({
                pagination: p
                    ? { ...pagination, page: pagination.page - 1, count: p.count }
                    : pagination,
                target,
            }))
        );

        return nmrTarget$;
    }

    getNMRTarget(target: BasicNSPTarget): FutureData<NSPTarget> {
        const { uniprotId, start, end } = target;
        const { bionotesApi } = routes;
        const chunkSize = 50;
        const targetChunk$ = (page: number) =>
            getValidatedJSON<Pagination<NMRScreeningFragment>>(
                `${bionotesApi}/nmr/${uniprotId}?start=${start}&end=${end}&limit=${chunkSize}&page=${
                    page + 1
                }`,
                paginationCodec(nmrFragmentCodec)
            ).flatMap(pagination => getNMRTarget(uniprotId, getResults(pagination)));

        const nmrTarget$ = getValidatedJSON<Pagination<NMRScreeningFragment>>(
            `${bionotesApi}/nmr/${uniprotId}?start=${start}&end=${end}&limit=1`,
            paginationCodec(nmrFragmentCodec)
        )
            .flatMap(pagination => {
                const pages = Math.ceil((pagination?.count ?? 0) / chunkSize);
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

    saveNMRTarget(target: NSPTarget) {
        const targetKeys = ["name", "uniprotId", "start", "end", "fragments"];
        const fragmentKeys = ["name", "ligand", "binding"];
        const ligandKeys = ["formula", "inChI", "name", "pubchemId", "smiles"];

        const fragments = target.fragments.map(f => {
            const fragment = {
                ...f,
                ligand: pick(f.ligand, ligandKeys),
            };

            return pick(fragment, fragmentKeys);
        });

        const t = {
            ...target,
            fragments,
        };

        const content = pick(t, targetKeys);
        const contents = JSON.stringify(content, null, 4);

        return this.save({
            contents,
            name: `${target.name.toLowerCase().replaceAll(/\s/g, "-")}`,
            extension: "json",
        });
    }

    private save(options: { name: string; contents: string; extension: string }) {
        const { name, extension, contents } = options;
        const filename = `${name}.${extension}`;
        const mimeType = lookup(filename);
        const blob = new Blob([contents], { type: mimeType || undefined });
        FileSaver.saveAs(blob, filename);
    }
}

export function getNMRTarget(
    uniprotId: string,
    nmrScreenings: NMRScreeningFragment[]
): FutureData<NSPTarget> {
    const fragments = nmrScreenings.map(nmr => ({
        ...nmr,
        binding: !nmr.details.type.toLowerCase().includes("not"),
    }));

    const targets = _(fragments)
        .groupBy(i => i.details.entity)
        .toPairs()
        .value();

    const target = targets[0];
    if (!target)
        return Future.error({
            message: i18n.t("NMR Error: no target found", { nsSeparator: false }),
        });
    if (targets.length > 1)
        return Future.error({
            message: i18n.t(
                `NMR Error: target should only be one. Instead received ${targets.length}.`,
                { nsSeparator: false }
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
                "NMR Unexpected Error: no start / no end on fragments. Unable to get target.",
                { nsSeparator: false }
            ),
        });

    return Future.success({
        name: targetName,
        uniprotId,
        fragments: tFragments,
        bindingCount: fragments.filter(({ binding }) => binding).length,
        notBindingCount: fragments.filter(({ binding }) => !binding).length,
        start,
        end,
    });
}
