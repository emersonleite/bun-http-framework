import type { ContextMiddleware } from "./types";

export const loggerMiddleware: ContextMiddleware = (ctx, next) => {
  console.log(ctx.req.method);
  return next();
};
