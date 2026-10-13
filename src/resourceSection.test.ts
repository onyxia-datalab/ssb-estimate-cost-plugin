import assert from "node:assert/strict";
import { test } from "node:test";
import type { RootForm } from "core/usecases/launcher/decoupledLogic/formTypes";
import { getResourceSectionTitle } from "./resourceSection";

test("finds the resource section by its Helm path regardless of its title", () => {
    for (const title of ["Resources (CPU/RAM)", "Ressurser", "Ressources"]) {
        const rootForm: RootForm = {
            main: [
                {
                    type: "group",
                    title: "Service",
                    helmValuesPath: ["service"],
                    description: undefined,
                    nodes: [],
                    canAdd: false,
                    canRemove: false,
                    isAutoInjected: undefined
                },
                {
                    type: "group",
                    title,
                    helmValuesPath: ["resources"],
                    description: undefined,
                    nodes: [],
                    canAdd: false,
                    canRemove: false,
                    isAutoInjected: undefined
                }
            ],
            global: [],
            dependencies: {},
            disabledDependencies: []
        };
        assert.equal(getResourceSectionTitle(rootForm), title);
        assert.equal(
            getResourceSectionTitle({ ...rootForm, main: rootForm.main.slice(0, 1) }),
            undefined
        );
    }
});
