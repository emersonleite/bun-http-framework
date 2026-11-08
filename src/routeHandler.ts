import type { BunRequest } from "bun";
import { createContext } from "./Context";
import type { ContextGuard, ContextHandler, RequestHandler } from "./types";

export function createRouteHandler(
  contextHandler: ContextHandler,
  guards: ContextGuard[],
): RequestHandler {
  return async (req: BunRequest) => {
    const ctx = await createContext(req);

    for (const guard of guards) {
      const result = guard(ctx);
      if (result) {
        return result;
      }
    }
    return contextHandler(ctx);
  };
}
