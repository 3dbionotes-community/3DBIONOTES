import { describe, expect, it } from "@jest/globals";
import { getCompositionRoot } from "../../../compositionRoot";

describe("PdbInfo", () => {
    it("with PDB 6zow is truthy", async () => {
        const compositionRoot = getCompositionRoot();
        const pdbInfo = await compositionRoot.getPdbInfo.execute("6zow").toPromise();

        expect(pdbInfo).toBeTruthy();
    });
});
