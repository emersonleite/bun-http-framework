import type { ContextGuard } from "./types";

export const guardAuth: ContextGuard = (ctx) => {
  if (!ctx.req.headers.get("authorization")) {
    return ctx.res.unauthorized();
  }
  return null;
};
