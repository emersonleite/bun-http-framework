import type { ContextResponse } from "../types";

export function buildContextResponse(): ContextResponse {
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
