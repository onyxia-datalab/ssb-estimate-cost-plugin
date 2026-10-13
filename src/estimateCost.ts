import { pricing } from "./config";

/** Convert chart CPU/memory values to cores and GiB before applying the rates. */
export function estimateWorkDayCost(resources: unknown): number | undefined {
    if (typeof resources !== "object" || resources === null || Array.isArray(resources)) {
        return undefined;
    }

    // Modern charts separate reserved resources (requests) from their maximum limits.
    const values = resources as Record<string, unknown>;
    const allocation = values.requests === undefined ? values : values.requests;
    if (
        typeof allocation !== "object" ||
        allocation === null ||
        Array.isArray(allocation)
    ) {
        return undefined;
    }

    const { cpu, memory } = allocation as Record<string, unknown>;
    const cpuCores = parseCpu(cpu);
    const memoryGi = parseMemory(memory);

    if (cpuCores === undefined || memoryGi === undefined) {
        return undefined;
    }

    const estimate =
        (cpuCores * pricing.cpuCostPerCorePerHour +
            memoryGi * pricing.memoryCostPerGiPerHour) *
        pricing.hoursPerWorkDay;

    return Number.isFinite(estimate) ? estimate : undefined;
}

function parseCpu(value: unknown): number | undefined {
    const match = quantityString(value)?.match(/^(\d+(?:\.\d+)?|\.\d+)(m)?$/);

    if (match === undefined || match === null) {
        return undefined;
    }

    return Number(match[1]) / (match[2] === "m" ? 1000 : 1);
}

function parseMemory(value: unknown): number | undefined {
    const match = quantityString(value)?.match(
        /^(\d+(?:\.\d+)?|\.\d+)([KMGTPE]i|[kMGTPE])?$/
    );

    if (match === undefined || match === null) {
        return undefined;
    }

    const suffix = match[2] ?? "";
    const exponent = suffix === "" ? 0 : "KMGTPE".indexOf(suffix[0].toUpperCase()) + 1;
    const base = suffix.endsWith("i") ? 1024 : 1000;

    return (Number(match[1]) * base ** exponent) / 1024 ** 3;
}

function quantityString(value: unknown): string | undefined {
    return typeof value === "string"
        ? value.trim()
        : typeof value === "number" && Number.isFinite(value)
          ? String(value)
          : undefined;
}
