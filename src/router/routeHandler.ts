import type { BunRequest } from "bun";
import { createContext } from "../context";
import type { ContextHandler, RequestHandler, RouteOptions } from "./types";

export function createRouteHandler(
  contextHandler: ContextHandler,
  { guards = [], middlewares = [] }: RouteOptions = {},
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

    const runMiddleware = async (i: number): Promise<Response> => {
      const middleware = middlewares[i];
      if (!middleware) return runGuardsAndHandler();
      return middleware(ctx, () => runMiddleware(i + 1));
    };

    return runMiddleware(0);
  };
}
