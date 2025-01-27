import axios from "axios";
import { describe, expect, it } from "@jest/globals";
import { getCompositionRoot } from "../../../compositionRoot";
import { defaultPdbId } from "../../../webapp/pages/app/AppRouter";

describe("PdbInfo", () => {
    it("with PDB 6zow to be truthy", async () => {
        axios.defaults.adapter = require("axios/lib/adapters/http");
        const compositionRoot = getCompositionRoot();
        const pdbInfo = await compositionRoot.getPdbInfo
            .execute({
                pdbId: defaultPdbId,
                onProcessDelay: (_reason: string) => {},
            })
            .toPromise();

        return expect(pdbInfo).toBeTruthy();
    });
});
