import type { OnyxiaCtx } from "./OnyxiaCtx";
import { estimateWorkDayCost } from "./estimateCost";
import { pricing } from "./config";

export async function createEstimatedCost(ctx: OnyxiaCtx) {
    const [React, { useCoreState }, { Text }, { tss }] = await Promise.all([
        ctx.import("react"),
        ctx.import("core"),
        ctx.import("onyxia-ui/Text"),
        ctx.import("tss")
    ]);

    const formatPrice = new Intl.NumberFormat("nb-NO", {
        style: "currency",
        currency: "NOK"
    });

    function EstimatedCost() {
        const launcher = useCoreState("launcher", "mainView");
        const { classes } = useStyles();

        if (!launcher.isReady || launcher.helmValues.resources === undefined) {
            return null;
        }

        const estimatedCost = estimateWorkDayCost(launcher.helmValues.resources);

        return React.createElement(Text, {
            className: classes.root,
            typo: "body 2",
            htmlComponent: "div",
            componentProps: { lang: "nb", "aria-live": "polite" },
            children: `Estimert pris per arbeidsdag (${pricing.hoursPerWorkDay} timer): ${
                estimatedCost === undefined ? "—" : formatPrice.format(estimatedCost)
            }`
        });
    };

    const useStyles = tss.withName("SsbEstimatedCost").create(({ theme }) => ({
        root: {
            marginBottom: theme.spacing(3)
        }
    }));

    return { EstimatedCost };
}
