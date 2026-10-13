import type { OnyxiaCtx } from "../../src/pluginSystem/pluginSystem";
export type { OnyxiaCtx };

declare global {
    interface Window {
        onOnyxiaCtxReady?: (onyxiaCtx: OnyxiaCtx) => void;
    }
}
