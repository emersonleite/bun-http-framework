import { guardAuth } from "../src/guards";
import { Pan } from "../src/core";
import type { Context } from "../src/types";
// import { Database } from 'bun:sqlite';

const app = new Pan();

/* async function logContext(ctx: Context) {
  console.log("query (search params) q", ctx.req.query.get("q"));
  console.log("pathname", ctx.req.pathname);
  console.log("params", ctx.req.params);
  let b = await ctx.req.body?.json();
} */

app.get(
  "/mosca/:id/ola/:id_2",
  (ctx) => {
    // logContext(ctx);
    return ctx.res.json({ mosca: true }, 200);
  },
  [guardAuth],
);

app.post(
  "/mosca/:id/ola/:id_2",
  async (ctx) => {
    // await logContext(ctx);
    console.log(ctx.req.params?.id!);
    return ctx.res.json({ message: "Não autorizado" }, 401);
  },
  [guardAuth],
);

app.listen(3001);
