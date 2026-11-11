# Bun HTTP Framework

Microframework HTTP experimental escrito em TypeScript e executado com [Bun](https://bun.com). O projeto demonstra um roteador próprio, contexto de requisição, handlers e guards.

> O projeto está em desenvolvimento. Algumas partes, como middlewares globais e integração com banco SQLite, ainda não foram implementadas.

## Pré-requisitos

- [Bun](https://bun.com) `1.3.2` ou compatível
- Docker e Docker Compose, para execução em container
- GNU Make, opcional, para usar os atalhos do `Makefile`

## Instalação local

Instale as dependências:

```bash
bun install
```

Inicie o servidor em modo de desenvolvimento, com watch habilitado:

```bash
bun run dev
```

O servidor fica disponível em `http://localhost:3001`.

## Docker

O `Dockerfile` define como a imagem da aplicação é criada:

| Instrução                             | Explicação                                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `FROM oven/bun:1.3.2`                 | Usa a imagem oficial do Bun na versão `1.3.2` como base.                                                                               |
| `WORKDIR /app`                        | Define `/app` como diretório de trabalho dentro do container.                                                                          |
| `COPY package.json bun.lockb ./`      | Copia os arquivos de dependências antes do restante do código, permitindo reaproveitar a camada de instalação quando elas não mudarem. |
| `RUN bun install --frozen-lockfile`   | Instala as dependências exatamente conforme o `bun.lockb`.                                                                             |
| `COPY . .`                            | Copia os arquivos do projeto para `/app`.                                                                                              |
| `EXPOSE 3001`                         | Documenta que a aplicação escuta na porta `3001` dentro do container.                                                                  |
| `CMD ["bun", "run", "app/server.ts"]` | Inicia o servidor quando o container é executado.                                                                                      |

O `docker-compose.yml` descreve o serviço `app` e seus recursos:

| Configuração              | Explicação                                                                  |
| ------------------------- | --------------------------------------------------------------------------- |
| `build: .`                | Constrói a imagem usando o `Dockerfile` no diretório atual.                 |
| `ports: "3001:3001"`      | Mapeia a porta `3001` do computador para a porta `3001` do container.       |
| `restart: unless-stopped` | Reinicia o serviço automaticamente, exceto quando ele é parado manualmente. |

Construa a imagem e inicie o container:

```bash
docker compose up --build
```

O parâmetro `--build` força a construção ou atualização da imagem antes de iniciar o serviço. Sem ele, o Compose reutiliza uma imagem já existente quando possível.

Para iniciar em segundo plano:

```bash
docker compose up -d --build
```

O parâmetro `-d` mantém o processo em segundo plano (modo detached).

Para acompanhar os logs:

```bash
docker compose logs -f app
```

Para parar e remover o container e a rede:

```bash
docker compose down
```

Esse comando remove os containers e a rede criada pelo Compose, mas não remove a imagem construída.

### Comandos com Make

O `Makefile` oferece atalhos para os comandos mais usados do Docker Compose. Execute `make <comando>` na raiz do projeto:

| Comando        | Descrição                                |
| -------------- | ---------------------------------------- |
| `make up`      | Inicia o container em segundo plano      |
| `make down`    | Para e remove os recursos do Compose     |
| `make build`   | Constrói a imagem sem iniciar o serviço  |
| `make rebuild` | Reconstrói a imagem e inicia o serviço   |
| `make logs`    | Exibe os logs da aplicação continuamente |
| `make ps`      | Mostra o status dos containers           |
| `make stop`    | Para o container sem removê-lo           |
| `make restart` | Reinicia o serviço                       |

Os comandos `up` e `rebuild` usam `-d`, então devolvem o terminal imediatamente. Use `make logs` para acompanhar a saída da aplicação. O comando `make stop` apenas para o container; seus recursos continuam disponíveis para que ele possa ser iniciado novamente com `make up`.

Depois de executar `make up` ou `make rebuild`, acesse `http://localhost:3001`.

## Guards

Guards são funções executadas antes do handler de uma rota. Eles podem validar condições da requisição, como autenticação, parâmetros ou permissões, e interromper o fluxo retornando uma resposta. Quando todas as validações passam, o handler é executado normalmente.

Essa abordagem permite manter regras de validação separadas da lógica principal de cada handler e reutilizá-las em diferentes rotas.

O projeto inclui dois guards prontos em `src/guards/`: `guardAuth`, que retorna `401` quando falta o header `Authorization`, e `guardRequireQuery`, que retorna `400` quando falta o parâmetro `?q=`. Um guard é uma função `(ctx) => Response | null`: retornar `null` deixa a requisição seguir.

## Estrutura principal

O código do framework fica em `src/`, dividido em módulos. Cada módulo tem um `index.ts` que reexporta a sua API e um `types.ts` com os tipos que ele possui. A aplicação de demonstração fica em `app/`. Os arquivos de configuração e execução permanecem na raiz do projeto.

Convenção de nomes: arquivos que exportam uma classe usam PascalCase (`Pan.ts`, `Router.ts`); os demais usam camelCase (`routeHandler.ts`, `guardAuth.ts`).

| Arquivo                      | Responsabilidade                                       |
| ---------------------------- | ------------------------------------------------------ |
| `app/server.ts`              | Cria a aplicação de demonstração e registra as rotas   |
| `src/index.ts`               | Entrypoint público da biblioteca (`Pan` e tipos)       |
| `src/core/Pan.ts`            | Classe `Pan`: expõe a API e inicia/para o servidor Bun |
| `src/router/Router.ts`       | Registra rotas `GET` e `POST`                          |
| `src/router/routeHandler.ts` | Monta o contexto e executa os guards e handlers        |
| `src/context/`               | Cria o contexto da requisição (`createContext`)        |
| `src/guards/`                | Contém as funções de validação das requisições         |
| `Dockerfile`                 | Define a imagem baseada em `oven/bun:1.3.2`            |
| `docker-compose.yml`         | Publica a porta `3001` e gerencia o serviço            |
| `Makefile`                   | Fornece atalhos para o Docker Compose                  |
| `EXEMPLOS-ROTAS.md`          | Exemplos de rotas                                      |

## Scripts do projeto

| Script    | Comando                                                                | Descrição                                        |
| --------- | ---------------------------------------------------------------------- | ------------------------------------------------ |
| `dev`     | `bun run --watch app/server.ts`                                        | Executa o servidor com recarregamento automático |
| `build`   | `bun build ./app/server.ts --outdir ./out --target bun && bun preview` | Gera a saída em `out` e inicia o preview         |
| `preview` | `bun run --watch ./out/server.js`                                      | Executa a saída gerada                           |

## Licença

Este repositório ainda não possui uma licença definida.
