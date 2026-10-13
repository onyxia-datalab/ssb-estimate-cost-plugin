# SSB plugin

Ports `web/public/custom-resources/ssb-plugin.ts` to the current Onyxia plugin API.
It displays `Estimert pris per arbeidsdag (8 timer)` in the launcher's `Ressurser`
accordion and updates automatically when CPU or memory changes, including YAML
edits. The estimate uses `helmValues.resources.cpu` and `helmValues.resources.memory`.

The plugin uses `window.onOnyxiaCtxReady`, `ctx.import`, `ctx.declareComponent`, and
`useCoreState("launcher", "mainView")`. It creates its own container next to the
existing resource inputs; no changes to Onyxia's source or additional IDs are needed.

Pricing constants and the accordion title are in `src/config.ts`. The rates and
USD/NOK conversion are preserved from the original plugin (5 February 2025), rather
than being fetched live. CPU values can be cores or millicores; memory can be bytes,
binary units such as Mi/Gi, or decimal units such as M/G. Missing or unsupported
quantities display `—` instead of an invalid price.

## Development

Install Onyxia's dependencies in `web` with `yarn`, then:

```bash
cd web/ssb-plugin
npm ci
```

```bash
npm run dev
```

The dev script builds and watches the plugin in
`web/public/custom-resources/ssb-plugin`, then starts Onyxia's dev server with the
SSB module script injected into its HTML head. Other app settings come from your
existing configuration. This overrides `CUSTOM_HTML_HEAD` only for that dev server;
it does not edit your YAML configuration or delete other custom resources.
Open the URL printed by this dev server, then a chart with
the `Ressurser` accordion and change CPU/memory to see the estimate update.

## Validation and production build

```bash
npm run test
npm run typecheck
npm run build
```

The manual esbuild script generates `ssb-plugin.zip` containing
`ssb-plugin/js/index.mjs`. Host the archive and configure Onyxia with:

```yaml
onyxia:
    web:
        env:
            CUSTOM_RESOURCES: "<https URL to ssb-plugin.zip>"
            CUSTOM_HTML_HEAD: |
                <script src="%PUBLIC_URL%/custom-resources/ssb-plugin/js/index.mjs?v=1" type="module"></script>
```

Keep any other deployment settings, and bump the script's version when deploying
an update. Disable the old SSB script to avoid displaying two estimates.
