import type { ContextGuard } from "../types";

export const guardAuth: ContextGuard = (ctx) => {
  if (!ctx.req.headers.get("authorization")) {
    return ctx.res.unauthorized();
  }
  return null;
};

export const guardRequireQuery: ContextGuard = (ctx) => {
  if (!ctx.req.query.get("q")) {
    return ctx.res.json({ erro: "faltou o parâmetro ?q=" }, 400);
  }
  return null;
};
