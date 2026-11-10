import type { BunRequest } from "bun";
import type { ContextRequest } from "./types";

export async function buildContextRequest(
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
