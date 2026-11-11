import type { Context } from "../context";

export type Next = () => Promise<Response>;

export type ContextMiddleware = (
  ctx: Context,
  next: Next,
) => Response | Promise<Response>;
