import { guardAuth } from "../src/guards";
import { Pan } from "../src/core";

const app = new Pan();

app.get(
  "/mosca/:id/ola/:id_2",
  (ctx) => {
    return ctx.res.json({ mosca: true }, 200);
  },
  [guardAuth],
);

app.post(
  "/mosca/:id/ola/:id_2",
  async (ctx) => {
    console.log(ctx.req.params?.id!);
    return ctx.res.json({ message: "Não autorizado" }, 401);
  },
  [guardAuth],
);

app.listen(3001);
