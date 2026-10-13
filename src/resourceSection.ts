import type { RootForm } from "core/usecases/launcher/decoupledLogic/formTypes";

/** Use the chart's resource group title, which may vary by chart and language. */
export function getResourceSectionTitle(rootForm: RootForm): string | undefined {
    return rootForm.main.find(
        node =>
            node.type === "group" &&
            node.helmValuesPath.length === 1 &&
            node.helmValuesPath[0] === "resources"
    )?.title;
}
