export interface Ligand {
    chainId: string; // "A" (normal) or "A_1" (for ligands)
    shortChainId: string; // "A"
    component: string; // "NAG"
    position: number; // 700
    id: string; // "A"
    shortId: string; // "NAG-700"
}

export function buildLigand(options: Omit<Ligand, "id" | "shortId" | "shortChainId">): Ligand {
    const shortId = [options.component, options.position].join("-");
    const id = `${options.chainId}:${options.component}-${options.position}`;
    const shortChainId = options.chainId.split("_")[0] || "";
    return { ...options, id, shortId: shortId, shortChainId };
}
