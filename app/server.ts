import { guardAuth } from "../src/guards";
import { loggerMiddleware } from "../src/middlewares";
import { Pan } from "../src/core";

const app = new Pan();

app.use({ middlewares: [loggerMiddleware] });

app.get(
  "/mosca/:id/ola/:id_2",
  (ctx) => {
    return ctx.res.json({ mosca: true }, 200);
  },
  { guards: [guardAuth] },
);

app.post(
  "/mosca/:id/ola/:id_2",
  async (ctx) => {
    console.log(ctx.req.params?.id!);
    return ctx.res.json({ message: "Não autorizado" }, 401);
  },
  { guards: [guardAuth] },
);

app.listen(3001);
