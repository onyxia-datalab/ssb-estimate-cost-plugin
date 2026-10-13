import * as fs from "node:fs/promises";
import * as path from "node:path";
import { build } from "esbuild";
import { zipSync } from "fflate";
import { getBuildOptions, pluginName, projectRoot } from "./lib";

const buildRoot = path.join(projectRoot, ".build");
const outDir = path.join(buildRoot, pluginName);
const zipFilePath = path.join(projectRoot, `${pluginName}.zip`);

try {
    await build(getBuildOptions({ outDir, sourcemap: false }));
    const script = await fs.readFile(path.join(outDir, "js", "index.mjs"));
    await fs.writeFile(
        zipFilePath,
        zipSync({ [`${pluginName}/js/index.mjs`]: script }, { level: 9 })
    );
} finally {
    await fs.rm(buildRoot, { recursive: true, force: true });
}

console.log(`Created ${zipFilePath}`);
