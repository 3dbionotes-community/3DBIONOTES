import { describe, expect, it } from "@jest/globals";
import { getCompositionRoot } from "../../../compositionRoot";
import { defaultPdbId } from "../../../webapp/pages/app/AppRouter";

describe("PdbInfo", () => {
    it("with PDB 6zow to be truthy", async () => {
        const compositionRoot = getCompositionRoot();
        const pdbInfo = await compositionRoot.getPdbInfo.execute(defaultPdbId).toPromise();

        expect(pdbInfo).toBeTruthy();
    });
    it("with PDB 9zzz rejects", async () => {
        const compositionRoot = getCompositionRoot();

        const getPdbInfo = compositionRoot.getPdbInfo.execute(defaultPdbId).toPromise();

        await expect(getPdbInfo).rejects.toEqual({});
    });
});
