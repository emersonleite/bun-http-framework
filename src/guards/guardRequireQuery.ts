import type { ContextGuard } from "../types";

export const guardRequireQuery: ContextGuard = (ctx) => {
  if (!ctx.req.query.get("q")) {
    return ctx.res.json({ erro: "faltou o parâmetro ?q=" }, 400);
  }
  return null;
};
