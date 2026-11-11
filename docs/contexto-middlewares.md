# Contexto: middlewares no Pan

Nota para retomar a conversa sobre a implementação de middlewares. Registra o estado do código, as decisões tomadas e os próximos passos.

## Estado do código

- **Tipos criados** (sem uso ainda):
  - `src/middlewares/types.ts`: `Next = () => Promise<Response>` e `ContextMiddleware = (ctx: Context, next: Next) => Response | Promise<Response>`.
  - `src/middlewares/loggerMiddleware.ts`: exemplo de middleware que registra o método da requisição e retorna `next()`.
  - `src/middlewares/index.ts`: reexporta `./loggerMiddleware` e `./types`.
  - `src/index.ts`: exporta `ContextMiddleware` e `Next` como tipos públicos.
- **`src/router/routeHandler.ts`** não tem lógica de middleware por enquanto. Decisão do usuário: o `createRouteHandler` continua só com guards e handler até a ligação ser implementada. O rascunho anterior (tipo local `Middleware`, laço `for...in`) foi removido.
- **Erro de tipo antigo**: `app/server.ts`, `ctx.req.params?.id`, com `Property 'id' does not exist on type '{}'`. Pode ser corrigido tipando `params` em `ContextRequest`.

## Decisões tomadas

1. **Manter `guards`** com esse nome. O contrato é `(ctx) => Response | null` e só barra ou deixa passar.
2. **Middleware é um conceito à parte**, com `(ctx, next)`. Ele pode rodar código antes e depois do handler e alterar a `Response`.
3. **Os middlewares são tratados dentro de `createRouteHandler`**, e **antes** dos guards. A ordem de execução é: middlewares, guards, handler.
4. **Guards são por rota**, como já é hoje. Guards por grupo ou globais ficam como evolução futura.
5. **Middlewares globais** usam o mesmo mecanismo. Só muda a origem da lista (ver abaixo).

## O que é o `next`

`next` é uma função que chama o próximo passo da cadeia: o próximo middleware ou, no fim, os guards e o handler. O middleware decide se e quando ele roda:

```ts
// segue
(ctx, next) => next();

// barra: não chama next
(ctx, next) => ctx.res.unauthorized();

// código antes e depois
async (ctx, next) => {
  const inicio = performance.now();
  const res = await next();
  console.log(`${ctx.req.pathname} ${performance.now() - inicio}ms`);
  return res;
};
```

O `next()` devolve a `Response` do restante da cadeia, por isso o tipo `Next` retorna `Promise<Response>`. A ordem em cadeia, com `[A, B]` e handler `H`, é `A (antes) → B (antes) → H → B (depois) → A (depois)`.

## Implementação proposta em `createRouteHandler`

Não se usa `for` para os middlewares: num laço, o `routeHandler` chamaria um após o outro sem esperar a resposta, e o middleware perderia a chance de agir depois do handler. O encadeamento é uma recursão com índice:

```ts
export function createRouteHandler(
  contextHandler: ContextHandler,
  guards: ContextGuard[],
  middlewares: ContextMiddleware[] = [],
): RequestHandler {
  return async (req: BunRequest) => {
    const ctx = await createContext(req);

    const runGuardsAndHandler = async (): Promise<Response> => {
      for (const guard of guards) {
        const result = guard(ctx);
        if (result) return result;
      }
      return contextHandler(ctx);
    };

    const dispatch = (i: number): Promise<Response> => {
      const middleware = middlewares[i];
      if (!middleware) return runGuardsAndHandler();
      return Promise.resolve(middleware(ctx, () => dispatch(i + 1)));
    };

    return dispatch(0);
  };
}
```

Ajustes no rascunho do usuário: trocar o tipo local `Middleware` por `ContextMiddleware` e fazer o `loggerMiddleware` retornar `next()`:

```ts
const loggerMiddleware: ContextMiddleware = (ctx, next) => {
  console.log(ctx.req.method);
  return next();
};
```

## Por que o `return` é necessário

A `Response` nasce no handler, no fundo da cadeia, e sobe uma camada de cada vez. Cada nível precisa fazer `return` do valor do nível de baixo:

- `return dispatch(0)`: devolve a resposta ao Bun. Sem ele, o Bun recebe `undefined`.
- `return runGuardsAndHandler()`: fecha o caso base, quando não há mais middlewares. Sem ele, o `dispatch` continuaria com `middleware` indefinido.
- `return next()` dentro do middleware: se ele só chamar `next();` sem retornar, o handler roda, mas a resposta é descartada. É o erro mais comum, e o tipo `Next` faz o TypeScript avisá-lo.

## Middlewares globais

Mesmo mecanismo, só muda de onde vem a lista:

- `Pan` ganha `use(middleware)`, que guarda numa lista global.
- Ao registrar uma rota, o `Router` junta as listas: `[...globais, ...daRota]`, e passa ao `createRouteHandler`, que não muda.
- **Cuidado com a ordem das chamadas:** se a lista for copiada no registro, um `app.use()` chamado depois de `app.get()` não vale para essa rota. Duas saídas: documentar que o `use()` vem antes das rotas (como no Express), ou ler a lista global na hora da requisição.
- **Limitação:** o 404 é tratado pelo `fetch` de `Pan.listen()`, fora do `createRouteHandler`, então middlewares globais não veem requisições para rotas inexistentes. Cobrir isso é uma decisão à parte.
- Guards globais seguiriam o mesmo raciocínio, com uma segunda lista.

## Próximos passos

1. Ligar `ContextMiddleware` ao `createRouteHandler` (código acima).
2. Passar a lista de middlewares do `Router` ao `createRouteHandler`, com a opção por rota.
3. Implementar `Pan.use()` para os middlewares globais e decidir a regra de ordem.
4. Corrigir o erro de tipo de `ctx.req.params` em `app/server.ts`.
5. Opcional: ligar `noUnusedLocals` e `noUnusedParameters` no `tsconfig.json` e criar o script `typecheck` (`tsc --noEmit`).
6. Atualizar o README (seção sobre middlewares) e o `PLANO-FUTURO-PAN.md`.

## Outras decisões da sessão

- **Prettier** foi adicionado como `devDependency`, com os scripts `format` e `format:check`. O `.gitattributes` força LF (`* text=auto eol=lf`).
- O `requests.http` foi removido de todo o histórico e passou a ser ignorado no git. O force push foi feito em `main` e `development`.
- **Estado do git ao escrever esta nota:** `development` está em `f5b0f85`, com 1 commit à frente do remoto. O `main` ainda está em `786f565`. O usuário vai levar para o `main` por conta própria.
