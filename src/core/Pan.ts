import { serve, type Server } from "bun";
import { Router } from "../router";
import type { ContextGuard, ContextHandler } from "../types";

export class Pan {
  private router: Router;
  private server?: Server<undefined>;
  // private guards: any; /* To be implemented */
  // private middlewares: any; /* To be implemented */

  constructor() {
    this.router = new Router();
  }

  private getRoutes() {
    return this.router.routes;
  }

  /* To be implemented */
  // use() {}

  get(
    path: string,
    contextHandler: ContextHandler,
    guards: ContextGuard[] = [],
  ) {
    this.router.get(path, contextHandler, guards);
  }

  post(
    path: string,
    contextHandler: ContextHandler,
    guards: ContextGuard[] = [],
  ) {
    this.router.post(path, contextHandler, guards);
  }

  listen(port?: number) {
    this.server = serve({
      port,
      routes: this.getRoutes(),
      async fetch() {
        return new Response("Not found", {
          status: 404,
        });
      },
    });

    console.info("Server running at " + this.server.url);

    return this;
  }

  stop(closeActiveConnections = false) {
    return this.server?.stop(closeActiveConnections);
  }
}
