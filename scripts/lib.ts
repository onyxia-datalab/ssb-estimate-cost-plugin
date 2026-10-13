import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { BuildOptions } from "esbuild";

export const pluginName = "ssb-plugin";
export const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

export function getBuildOptions(params: {
    outDir: string;
    sourcemap: boolean;
}): BuildOptions {
    return {
        entryPoints: [path.join(projectRoot, "src", "main.ts")],
        outfile: path.join(params.outDir, "js", "index.mjs"),
        bundle: true,
        packages: "bundle",
        format: "esm",
        platform: "browser",
        target: "es2020",
        sourcemap: params.sourcemap,
        logLevel: "info"
    };
}
