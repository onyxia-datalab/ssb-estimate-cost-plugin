import assert from "node:assert/strict";
import { test } from "node:test";
import { estimateWorkDayCost } from "./estimateCost";

test("preserves the legacy eight-hour estimate for millicores and GiB", () => {
    assert.equal(
        estimateWorkDayCost({ cpu: "2000m", memory: "4Gi" }),
        (2 * 0.034802 * 11.7 + 4 * 0.004664 * 11.7) * 8
    );
});

test("modern charts price reserved resources, not the limits", () => {
    assert.equal(
        estimateWorkDayCost({
            requests: { cpu: "100m", memory: "2Gi" },
            limits: { cpu: "15000m", memory: "50Gi" }
        }),
        estimateWorkDayCost({ cpu: "100m", memory: "2Gi" })
    );
    assert.equal(
        estimateWorkDayCost({
            requests: { cpu: "invalid" },
            limits: { cpu: 1, memory: "1Gi" }
        }),
        undefined
    );
});

test("equivalent CPU and memory quantities produce the same estimate", () => {
    const expected = estimateWorkDayCost({ cpu: "500m", memory: "1Gi" });
    for (const cpu of [0.5, "0.5", ".5"]) {
        for (const memory of ["1024Mi", "1048576Ki", 1073741824, "1073741824"]) {
            assert.equal(estimateWorkDayCost({ cpu, memory }), expected);
        }
    }
});

test("decimal SI memory is converted from bytes to GiB", () => {
    assert.equal(
        estimateWorkDayCost({ cpu: "1", memory: "1G" }),
        (0.034802 * 11.7 + (1000 ** 3 / 1024 ** 3) * 0.004664 * 11.7) * 8
    );
});

test("missing, invalid and negative resources never produce a price", () => {
    for (const resources of [
        null,
        {},
        [],
        { cpu: "500m" },
        { cpu: "cpu", memory: "1Gi" },
        { cpu: -1, memory: "1Gi" },
        { cpu: 1, memory: "-1Gi" },
        { cpu: Infinity, memory: "1Gi" },
        { cpu: 1, memory: "2GiB" }
    ]) {
        assert.equal(estimateWorkDayCost(resources), undefined);
    }
    assert.equal(estimateWorkDayCost({ cpu: 0, memory: 0 }), 0);
});
