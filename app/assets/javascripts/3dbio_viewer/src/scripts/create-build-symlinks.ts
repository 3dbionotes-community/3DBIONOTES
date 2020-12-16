import fs from "fs";
import path from "path";
// @ts-ignore
import lnf from "lnf";

interface AssetManifest {
    files: Record<string, string>;
    entrypoints: string[];
}

function createBuildSymblinks() {
    const buildPath = path.join(path.dirname(__filename), "../../build/");
    const manifestPath = path.join(buildPath, "asset-manifest.json");

    const contents = fs.readFileSync(manifestPath, "utf8");
    const assets = JSON.parse(contents) as AssetManifest;

    assets.entrypoints.forEach(entrypoint => {
        const filename = path.basename(entrypoint);
        const [name, _hash, ...rest] = filename.split(".");
        const newFilename = [name, ...rest].join(".");
        const buildAppPath = path.join(buildPath, "app");
        const newEntrypoint = path.join(buildAppPath, newFilename);

        console.log(`${path.basename(newEntrypoint)} -> ${entrypoint}`);
        fs.mkdirSync(buildAppPath, { recursive: true });
        lnf(path.join("..", entrypoint), newEntrypoint);
    });
}

createBuildSymblinks();
