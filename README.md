# Bun HTTP Framework

Microframework HTTP experimental escrito em TypeScript e executado com [Bun](https://bun.com). O projeto demonstra um roteador próprio, contexto de requisição, handlers e guards.

> O projeto está em desenvolvimento. Algumas partes, como middlewares globais e integração com banco SQLite, ainda estão preparadas para implementação.

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

Construa a imagem e inicie o container:

```bash
docker compose up --build
```

Para iniciar em segundo plano:

```bash
docker compose up -d --build
```

Para acompanhar os logs:

```bash
docker compose logs -f app
```

Para parar e remover o container e a rede:

```bash
docker compose down
```

### Comandos com Make

O `Makefile` oferece atalhos para os comandos mais usados:

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

Depois de executar `make up` ou `make rebuild`, acesse `http://localhost:3001`.

## Guards

Guards são funções executadas antes do handler de uma rota. Eles podem validar condições da requisição, como autenticação, parâmetros ou permissões, e interromper o fluxo retornando uma resposta. Quando todas as validações passam, o handler é executado normalmente.

Essa abordagem permite manter regras de validação separadas da lógica principal de cada handler e reutilizá-las em diferentes rotas.

## Estrutura principal

| Arquivo              | Responsabilidade                                 |
| -------------------- | ------------------------------------------------ |
| `server.ts`          | Cria a aplicação e registra as rotas             |
| `Pan.ts`             | Expõe a API da aplicação e inicia o servidor Bun |
| `Router.ts`          | Registra rotas `GET` e `POST`                    |
| `routeHandler.ts`    | Monta o contexto e executa os guards e handlers  |
| `Context.ts`         | Cria o contexto da requisição                    |
| `guards.ts`          | Contém as funções de validação das requisições   |
| `types.ts`           | Define os tipos usados pelo framework            |
| `Dockerfile`         | Define a imagem baseada em `oven/bun:1.3.2`      |
| `docker-compose.yml` | Publica a porta `3001` e gerencia o serviço      |
| `Makefile`           | Fornece atalhos para o Docker Compose            |

## Scripts do projeto

| Script    | Comando                                                            | Descrição                                        |
| --------- | ------------------------------------------------------------------ | ------------------------------------------------ |
| `dev`     | `bun run --watch server.ts`                                        | Executa o servidor com recarregamento automático |
| `build`   | `bun build ./server.ts --outdir ./out --target bun && bun preview` | Gera a saída em `out` e inicia o preview         |
| `preview` | `bun run --watch ./out/server.js`                                  | Executa a saída gerada                           |

## Licença

Este repositório ainda não possui uma licença definida.
