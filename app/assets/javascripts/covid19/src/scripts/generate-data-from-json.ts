import fs from "fs";
import path from "path";
import _ from "lodash";

/* COVID19 data with a lot of structures result in error: "Expression produces a union type
   that is too complex to represent". Workaround: split structures in chunks. */

function toJson(obj: unknown): string {
    return JSON.stringify(obj, null, 4);
}

interface Covid19JsonData {
    Organisms: unknown;
    Ligands: unknown;
    Structures: unknown[];
}

function main() {
    const [inputJsonPath] = process.argv.slice(2);
    if (!inputJsonPath) throw new Error(`Usage: generate-data-from-json INPUT.json`);

    const outputTsPath = path.join(__dirname, "../data/covid19-data.ts");
    const data = JSON.parse(fs.readFileSync(inputJsonPath, "utf8")) as Covid19JsonData;
    const chunkedStructures = _.chunk(data.Structures, 100);

    const tsContents = `
        // @ts-nocheck-REMOVE-WHEN-VALIDATED
        import { Covid19Data } from "./Covid19Data.types";

        export const data: Covid19Data = {
            Organisms: ${toJson(data.Organisms)},
            Ligands: ${toJson(data.Ligands)},
            Structures: ${toJson(chunkedStructures)},
        };
    `;

    fs.writeFileSync(outputTsPath, tsContents);
    console.debug(`Written: ${outputTsPath}`);
}

main();

export {};
