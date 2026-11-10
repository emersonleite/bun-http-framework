import type { Context } from "./context";

export type ContextHandler = (ctx: Context) => Response | Promise<Response>;
