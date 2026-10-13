import * as fs from "node:fs/promises";
import * as path from "node:path";
import { spawn } from "node:child_process";
import { context } from "esbuild";
import { getBuildOptions, pluginName, projectRoot } from "./lib";

const webDir = path.dirname(projectRoot);
const { name } = JSON.parse(await fs.readFile(path.join(webDir, "package.json"), "utf8"));

if (name !== "onyxia-web") {
    throw new Error("Run this plugin from an Onyxia checkout at web/ssb-plugin.");
}

// Keep existing custom resources, including the legacy plugin, intact.
const outDir = path.join(webDir, "public", "custom-resources", pluginName);
const buildContext = await context(getBuildOptions({ outDir, sourcemap: true }));
await buildContext.rebuild();
await buildContext.watch();

const onyxiaDevProcess = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "dev"],
    {
        cwd: webDir,
        stdio: "inherit",
        // vite-envs gives process env precedence over .env.local.yaml's generated values.
        env: {
            ...process.env,
            CUSTOM_HTML_HEAD: `<script src="%PUBLIC_URL%/custom-resources/${pluginName}/js/index.mjs" type="module"></script>`
        }
    }
);

let isShuttingDown = false;

async function shutdown(exitCode: number) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    if (onyxiaDevProcess.exitCode === null) onyxiaDevProcess.kill();
    await buildContext.dispose();
    process.exit(exitCode);
}

process.on("SIGINT", () => void shutdown(130));
process.on("SIGTERM", () => void shutdown(143));
onyxiaDevProcess.on("exit", code => void shutdown(code ?? 0));
onyxiaDevProcess.on("error", error => {
    console.error(error);
    void shutdown(1);
});
