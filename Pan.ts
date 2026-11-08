import { serve } from "bun";
import { createContext } from "./Context";
import { guardAuth, guardRequireQuery } from "./guards";
import { Router } from "./Router";
import type { ContextGuard, ContextHandler } from "./types";
import { createRouteHandler } from "./routeHandler";

export class Pan {
  private router: Router;
  // private guards: any; /* To be implemented */
  // private middlewares: any; /* To be implemented */

  constructor() {
    this.router = new Router();
  }

  private getRoutes() {
    return this.router.routes;
  }

  /* To be implemented */
  // use() {}

  get(
    path: string,
    contextHandler: ContextHandler,
    guards: ContextGuard[] = [],
  ) {
    this.router.get(path, contextHandler, guards);
  }

  post(
    path: string,
    contextHandler: ContextHandler,
    guards: ContextGuard[] = [],
  ) {
    this.router.post(path, contextHandler, guards);
  }

  listen(port?: number) {
    let server = serve({
      port,
      routes: {
        // Forma de definir rota diretamente:
        "/ola-mundo": {
          GET: (req) => {
            console.log(req);
            return new Response("Ola", { status: 200 });
          },
        },
        // Rota de teste: o fluxo do contexto escrito DENTRO da rota,
        // chamando createContext e guardAuth na mão (sem Router/createRouteHandler).
        "/teste-ctx/:nome": {
          GET: async (req) => {
            // 1) Cria o ctx com a função real
            const ctx = await createContext(req);

            // 2) Roda vários guards, em ordem (null = liberou, Response = barrou)
            const guards = [guardAuth, guardRequireQuery];

            for (const guard of guards) {
              const barrou = guard(ctx);
              if (barrou) return barrou; // o primeiro que barrar encerra tudo
            }

            // 3) Handler inline (o que você escreveria no app.get)
            return ctx.res.json({
              nome: ctx.req.params.nome,
              q: ctx.req.query.get("q"),
              pathname: ctx.req.pathname,
            });
          },
        },

        // Mesma rota, mas deixando o createRouteHandler fazer os passos 1 e 2.
        // É exatamente o que o Router faz quando você usa app.get(...).
        //
        // NOTA: o que acontece em `return contextHandler(ctx)` (routeHandler.ts):
        //  - `contextHandler` é a função (ctx) => ctx.res.json(...) escrita
        //    abaixo, passada como 1º argumento do createRouteHandler.
        //  - Ela NÃO rodou até agora. O createRouteHandler só a guardou (closure).
        //  - Essa linha só é alcançada se NENHUM guard barrou. Se algum guard
        //    devolver uma Response, o `return result` anterior encerra tudo.
        //  - Aqui ela é CHAMADA com o ctx pronto: é só neste instante que o
        //    parâmetro `ctx` da função abaixo ganha valor.
        //  - O que ela devolve (a Response) é devolvido pelo wrapper ao Bun,
        //    que responde ao cliente. O `return` na frente é isso: repassar.
        "/teste-ctx-guards/:nome": {
          GET: createRouteHandler(
            (ctx) => ctx.res.json({ nome: ctx.req.params.nome }),
            [guardAuth],
          ),
        },
        // NOTA: esta forma também é uma opção. Em vez de passar o resultado do
        // createRouteHandler direto no GET, você escreve o (req) => ... e chama o
        // wrapper na mão: createRouteHandler(...)(req).
        //  - Funciona igual à rota de cima: o Bun chama este (req) => ... e
        //    o wrapper recebe o mesmo req.
        //  - Quando usar: se precisar fazer algo com o req ANTES ou DEPOIS do
        //    wrapper (log, métrica, alterar a Response, escolher os guards
        //    conforme o req).
        //  - Detalhe: o createRouteHandler roda a CADA requisição, recriando o wrapper.
        //    Isso é barato (só cria uma função), não é problema de performance.
        //    Se não precisa desse controle extra, prefira GET: createRouteHandler(...)
        //    por clareza: o wrapper é criado uma vez só.
        "/teste-ctx-guards-2/:nome": {
          GET: (req) =>
            createRouteHandler(
              (ctx) => ctx.res.json({ nome: ctx.req.params.nome }),
              [guardAuth],
            )(req),
        },
        ...this.getRoutes(),
      },
      async fetch() {
        return new Response("Not found", {
          status: 404,
        });
      },
    });

    console.info("Server running at " + server.url);

    return this;
  }
}
