# Plano futuro: biblioteca PAN

## Objetivo

Transformar este projeto em uma biblioteca HTTP chamada PAN, baseada em Bun e TypeScript, mantendo o código de exemplo separado do núcleo reutilizável.

A primeira forma de distribuição pode ser exclusivamente pelo GitHub. A publicação no npm não é obrigatória para a primeira versão.

## Situação atual

- O projeto já possui roteador, contexto de requisição, handlers e guards.
- `src/core/Pan.ts` (classe `Pan`) já não contém rotas de exemplo; elas foram movidas para `EXEMPLOS-ROTAS.md`.
- `app/server.ts` cria a aplicação e inicia o servidor diretamente.
- O roteador atualmente registra principalmente rotas `GET` e `POST`.
- O `package.json` está marcado como privado e ainda descreve uma aplicação, não uma biblioteca distribuível.
- Não há uma suíte de testes automatizados.
- A implementação depende diretamente do runtime Bun.
- A licença do projeto ainda não foi definida.

## Decisões provisórias

- O foco inicial será Bun.
- O repositório do GitHub será a primeira forma de distribuição.
- O núcleo da PAN não deve conter rotas específicas da aplicação de exemplo.
- A API pública deve ser pequena e tipada.
- A compatibilidade com outros runtimes poderá ser avaliada posteriormente.

## Plano de implementação

### 1. Separar o núcleo do exemplo

- ~~Remover rotas fixas e guards concretos de `src/core/Pan.ts`.~~ (feito)
- Manter `src/core/Pan.ts` responsável apenas pela criação da aplicação, registro de rotas e inicialização do servidor.
- Manter `app/server.ts` como aplicação de demonstração.
- Criar exemplos separados, se necessário, em uma pasta como `examples/`.

### 2. Definir a API pública

- Criar `src/index.ts` como entrypoint da biblioteca.
- Exportar `Pan`, tipos públicos, router e utilitários que façam parte do contrato.
- Definir uma API inicial semelhante a:

```ts
import { Pan } from "pan";

const app = new Pan();

app.get("/users/:id", async (ctx) => {
  return ctx.res.json({
    id: ctx.req.params.id,
  });
});

app.listen(3000);
```

- Evitar expor estruturas internas mutáveis sem necessidade.
- Documentar o comportamento de rotas duplicadas, parâmetros e respostas.

### 3. Completar recursos essenciais

- Implementar `PUT`, `PATCH` e `DELETE`, já previstos nos tipos, ou remover esses tipos até que sejam suportados.
- Definir suporte a handlers e guards assíncronos.
- Adicionar middleware global e por rota.
- Adicionar tratamento centralizado de erros.
- Definir respostas padrão para rota inexistente e método não permitido.
- Melhorar os tipos de parâmetros, body, query e respostas JSON.
- Avaliar agrupamento de rotas e prefixos.

### 4. Preparar o pacote

Atualizar o `package.json` para representar uma biblioteca:

- remover `private: true` quando o projeto estiver pronto para distribuição;
- definir `exports`;
- definir o entrypoint e os tipos gerados;
- criar scripts de build, teste e verificação de tipos;
- manter o build da aplicação de exemplo separado do build da biblioteca;
- definir uma versão inicial, por exemplo `0.1.0`.

A estrutura esperada poderá ser semelhante a:

```text
src/
  index.ts
  core/        # Pan.ts, index.ts
  router/      # Router.ts, routeHandler.ts, types.ts, index.ts
  context/     # createContext.ts, types.ts, index.ts
  guards/      # guardAuth.ts, guardRequireQuery.ts, types.ts, index.ts
app/
  server.ts
examples/
  basic-server.ts
  guards.ts
```

### 5. Adicionar testes

Criar testes para:

- registro e execução de rotas;
- parâmetros de rota;
- query string;
- métodos HTTP;
- guards que permitem ou interrompem a requisição;
- handlers assíncronos;
- respostas JSON, texto e não autorizado;
- rota inexistente;
- erros lançados por handlers;
- conflitos ou duplicidade de rotas.

Cada mudança relevante na API pública deve incluir testes correspondentes.

### 6. Documentar o uso

Atualizar o README com:

- instalação pelo GitHub;
- requisitos de versão do Bun;
- exemplo mínimo de aplicação;
- registro de rotas;
- uso de guards e middleware;
- estrutura da API pública;
- limitações atuais;
- política de versões;
- licença.

Exemplo de instalação pelo GitHub:

```bash
bun add github:USUARIO/pan
```

Também pode ser usado um repositório com tag ou commit específico:

```bash
bun add github:USUARIO/pan#v0.1.0
```

## Publicação somente pelo GitHub

A distribuição pelo GitHub é suficiente para as primeiras versões. O repositório deve ter:

- visibilidade pública, caso a biblioteca seja aberta;
- README completo;
- licença definida;
- tags de versão, como `v0.1.0`;
- releases com notas de mudança;
- exemplos executáveis;
- GitHub Actions para testes e build;
- política clara para breaking changes.

O usuário poderá instalar diretamente com Bun usando a URL ou a referência do repositório. O npm poderá ser adotado futuramente sem exigir uma mudança grande na API, desde que o `package.json` seja preparado desde o início.

## Checklist de versão inicial

- [x] Separar rotas de exemplo do núcleo da PAN.
- [x] Criar `src/index.ts`.
- [ ] Definir exports públicos.
- [ ] Decidir a licença.
- [ ] Definir nome final do pacote e do repositório.
- [ ] Completar ou revisar os métodos HTTP suportados.
- [ ] Adicionar tratamento de erros.
- [ ] Adicionar testes automatizados.
- [ ] Atualizar o README.
- [ ] Configurar build da biblioteca.
- [ ] Configurar GitHub Actions.
- [ ] Criar a tag `v0.1.0`.
- [ ] Publicar a primeira release no GitHub.
- [ ] Testar instalação em um projeto Bun separado.

## Critérios para considerar a PAN pronta para a primeira release

- Uma aplicação nova consegue instalar a PAN pelo GitHub.
- O usuário consegue criar uma rota sem importar código específico do projeto original.
- O build da biblioteca não inicia um servidor automaticamente.
- A API pública está documentada e coberta pelos testes principais.
- Uma tag versionada permite reproduzir a instalação.
- O README explica claramente que a primeira versão é Bun-only.

## Ajustes futuros (revisão da documentação do `Bun.serve`)

Origem: https://bun.com/docs/runtime/http/server, comparada com o código atual. Itens ordenados por impacto.

### Mais relevantes

- [ ] **Erros em handler ou guard:** `createRouteHandler` (`src/router/routeHandler.ts`) não tem `try/catch` e o `serve` não recebe a opção `error`. Passar `error(err)` ao `serve`, devolvendo 500 em JSON e registrando o erro no log.
- [ ] **Guards assíncronos:** `guard(ctx)` não usa `await` e o tipo é `Response | null`. Um guard assíncrono devolveria uma Promise (truthy) e a rota responderia com ela. Aceitar `Response | null | Promise<...>` e fazer `await guard(ctx)`.
- [ ] **405 ausente:** quando o path existe mas o método não (ex.: `DELETE /mosca/1/ola/2`), a requisição provavelmente cai no 404 do `fetch`. Testar; se confirmado, checar o path em `routes` e devolver 405 com o header `Allow`. A doc não descreve esse caso, então é inferência a validar.
- [ ] **Porta e opções do `listen`:** o Bun lê `BUN_PORT`, `PORT` ou `NODE_PORT` quando `port` não é passado, mas `app/server.ts` fixa 3001. Aceitar `listen(options?: { port?, hostname? })` e usar `PORT` no exemplo. Permite `port: 0` nos testes, lendo `server.port`.
- [ ] **Rotas duplicadas:** `addRoute` (`src/router/Router.ts`) sobrescreve em silêncio o mesmo método e path registrados duas vezes. Lançar erro ou avisar.

### Menores

- [ ] **`listen()` chamado duas vezes:** sobe um segundo servidor e perde a referência ao primeiro. Lançar erro se `this.server` já existir.
- [ ] **`stop()`:** retorna Promise; tipar como `Promise<void>` e documentar. Para shutdown suave, considerar `closeIdleConnections()`.
- [ ] **Tipo do servidor:** a doc usa `Serve.Options<undefined>`. Se houver WebSocket no futuro, tornar `Pan` genérico (`Pan<T>`).
- [ ] **`createContext` desnecessariamente `async`:** `buildContextRequest` não espera nada. Tornar síncrono evita uma Promise por requisição.
- [ ] **IP e timeout por requisição:** o Bun passa `(req, server)` ao handler, mas `RequestHandler` ignora o `server`. Expor no `ctx` se for preciso `server.requestIP(req)` ou `server.timeout(req, 0)` (útil para SSE).
- [ ] **Versão do Bun:** o `Dockerfile` usa `oven/bun:1.3.2` e o ambiente local roda 1.4.2. `routes` exige 1.2.3 ou mais, então funciona, mas convém alinhar as versões.
- [ ] **`fetch` do `listen` é opcional:** desde o Bun 1.2.3 o `fetch` só é obrigatório em versões anteriores. Com o Bun atual (1.3.2 no Docker, 1.4.2 local) ele serve apenas para definir o 404 customizado (hoje `"Not found"`, status 404) e é o lugar natural para tratar o 405. Decidir se mantém o `fetch` ou usa uma rota wildcard `"/*"` com `ctx.res.notFound()`. Sem nenhum dos dois, vale o 404 padrão do Bun, cujo corpo não foi verificado. Se a PAN passar a suportar Bun < 1.2.3, o `fetch` volta a ser obrigatório.

### A verificar na doc

A página de `Bun.serve` não cobre a tipagem de `req.params`, a precedência entre rotas nem a opção `development`. Consultar https://bun.com/docs/runtime/http/routing antes de decidir sobre esses pontos.
