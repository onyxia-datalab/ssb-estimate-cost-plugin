import { createEstimatedCost } from "./EstimatedCost";
import { getResourceSectionTitle } from "./resourceSection";

window.onOnyxiaCtxReady = async ctx => {
    const { getCore } = await ctx.import("core");
    const core = await getCore();
    const { EstimatedCost } = await createEstimatedCost(ctx);
    const { mount } = ctx.declareComponent(EstimatedCost);

    {
        let parent: HTMLElement | null = null;
        let container: HTMLElement | null = null;

        const sync = () => {
            const launcher = core.states.launcher.getMainView();
            const resourceSectionTitle = launcher.isReady
                ? getResourceSectionTitle(launcher.rootForm)
                : undefined;
            const page = document.getElementById("page-container-launcher");
            const accordion = Array.from(
                page?.querySelectorAll("[data-title]") ?? []
            ).find(
                element => element.getAttribute("data-title") === resourceSectionTitle
            );
            const nextParent =
                accordion?.querySelector<HTMLElement>(".MuiAccordionDetails-root") ??
                null;

            if (
                nextParent === parent &&
                (nextParent === null || container?.parentElement === nextParent)
            ) {
                return;
            }

            mount(null);
            container?.remove();
            container = null;
            parent = nextParent;

            if (parent === null) {
                return;
            }

            container = document.createElement("div");
            parent.prepend(container);
            mount(container);
        };

        const observer = new MutationObserver(sync);
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["data-title"]
        });
        sync();
    }
};
