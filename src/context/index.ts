import type { BunRequest } from "bun";
import type { Context, ContextRequest, ContextResponse } from "../types";

async function buildContextRequest(
  request: BunRequest,
): Promise<ContextRequest> {
  const url = new URL(request.url);

  let req = request as ContextRequest;

  req.query = url.searchParams;
  req.pathname = url.pathname;

  // NOTA sobre o body: não precisa implementar nada aqui. O req do Bun já é um
  // Request padrão, então ctx.req.json() / .text() / .formData() já funcionam.
  //  - Só dá para ler o body UMA vez (um guard que ler impede o handler de ler).
  //  - Body vazio lança erro no .json() (ex.: GET sem body).
  // Se isso virar problema, leia uma vez aqui e guarde no ctx, por exemplo:
  //   req.parsedBody = await request.json().catch(() => null);
  // Enquanto ninguém ler o body em mais de um lugar, ctx.req.json() basta.

  return req;
}

function buildContextResponse(): ContextResponse {
  return {
    json: (data: any, status = 200) => Response.json(data, { status }),
    text: (message, status = 200) => new Response(message, { status }),
    unauthorized: (message?: string) => {
      return new Response(message || "Unauthorized", { status: 401 });
    },
    notFound: (message?: string) =>
      new Response(message || "Not found", { status: 404 }),
  };
}

export async function createContext(req: BunRequest): Promise<Context> {
  return {
    req: await buildContextRequest(req),
    res: buildContextResponse(),
  };
}
