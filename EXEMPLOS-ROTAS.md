# Exemplos de rotas (documentação)

Estes exemplos estavam definidos diretamente em `Pan.listen()` (`src/core/index.ts`) como rotas de teste do fluxo de contexto/guards. Foram removidos do código e ficam aqui como referência. O `listen()` agora só registra as rotas vindas do `Router` (`app.get` / `app.post`).

Imports usados nos exemplos:

```ts
import { createContext } from "../context";
import { guardAuth, guardRequireQuery } from "../guards";
import { createRouteHandler } from "../utils/routeHandler";
```

## 1. Rota direta do Bun

Forma de definir uma rota diretamente no `serve`, sem Router:

```ts
"/ola-mundo": {
  GET: (req) => {
    console.log(req);
    return new Response("Ola", { status: 200 });
  },
},
```

## 2. Fluxo do contexto escrito dentro da rota

Chama `createContext` e os guards na mão (sem Router/`createRouteHandler`):

```ts
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
```

## 3. Usando `createRouteHandler`

Mesma rota, mas deixando o `createRouteHandler` fazer os passos 1 e 2. É exatamente o que o Router faz quando você usa `app.get(...)`.

```ts
"/teste-ctx-guards/:nome": {
  GET: createRouteHandler(
    (ctx) => ctx.res.json({ nome: ctx.req.params.nome }),
    [guardAuth],
  ),
},
```

O que acontece em `return contextHandler(ctx)` (`src/utils/routeHandler.ts`):

- `contextHandler` é a função `(ctx) => ctx.res.json(...)` passada como 1º argumento do `createRouteHandler`.
- Ela **não** rodou até agora. O `createRouteHandler` só a guardou (closure).
- Essa linha só é alcançada se **nenhum** guard barrou. Se algum guard devolver uma `Response`, o `return result` anterior encerra tudo.
- Aqui ela é chamada com o `ctx` pronto: só neste instante o parâmetro `ctx` ganha valor.
- A `Response` que ela devolve é repassada pelo wrapper ao Bun, que responde ao cliente.

## 4. Chamando o wrapper na mão

Em vez de passar o resultado do `createRouteHandler` direto no `GET`, escreve-se o `(req) => ...` e chama-se o wrapper: `createRouteHandler(...)(req)`.

```ts
"/teste-ctx-guards-2/:nome": {
  GET: (req) =>
    createRouteHandler(
      (ctx) => ctx.res.json({ nome: ctx.req.params.nome }),
      [guardAuth],
    )(req),
},
```

- Funciona igual à rota anterior: o Bun chama este `(req) => ...` e o wrapper recebe o mesmo `req`.
- **Quando usar:** se precisar fazer algo com o `req` antes ou depois do wrapper (log, métrica, alterar a `Response`, escolher os guards conforme o `req`).
- **Detalhe:** o `createRouteHandler` roda a cada requisição, recriando o wrapper. Isso é barato (só cria uma função), não é problema de performance. Se não precisa desse controle extra, prefira `GET: createRouteHandler(...)` por clareza: o wrapper é criado uma vez só.

## Requests de teste (antes em `requests.http`)

```http
### Rota simples (sem guard)
GET {{baseUrl}}/ola-mundo

### Rota inline (200)
GET {{baseUrl}}/teste-ctx/emerson?q=oi
Authorization: Bearer {{token}}

### Rota inline sem Authorization (401)
GET {{baseUrl}}/teste-ctx/emerson?q=oi

### Rota inline com Authorization mas sem ?q (400, barrado pelo 2º guard)
GET {{baseUrl}}/teste-ctx/emerson
Authorization: Bearer {{token}}

### createRouteHandler (200)
GET {{baseUrl}}/teste-ctx-guards/emerson
Authorization: Bearer {{token}}

### createRouteHandler chamado na mão (200)
GET {{baseUrl}}/teste-ctx-guards-2/emerson
Authorization: Bearer {{token}}

### createRouteHandler sem Authorization (401)
GET {{baseUrl}}/teste-ctx-guards/emerson
```
