import type { Context } from "./context";

export type ContextGuard = (ctx: Context) => Response | null;
