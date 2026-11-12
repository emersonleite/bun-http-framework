import { serve, type Server } from "bun";
import { Router, type ContextHandler, type RouteOptions } from "../router";
import type { ContextGuard } from "../guards";
import type { ContextMiddleware } from "../middlewares";

export class Pan {
  private router: Router;
  private server?: Server<undefined>;
  private globalMiddlewares: ContextMiddleware[] = [];
  private globalGuards: ContextGuard[] = [];

  constructor() {
    this.router = new Router();
  }

  private getRoutes() {
    return this.router.routes;
  }

  /** Registers global guards/middlewares. Applies only to routes declared after it. */
  public use(options: RouteOptions) {
    this.globalGuards.push(...(options.guards ?? []));
    this.globalMiddlewares.push(...(options.middlewares ?? []));
  }

  private withGlobals(options: RouteOptions = {}): RouteOptions {
    return {
      guards: [...this.globalGuards, ...(options.guards ?? [])],
      middlewares: [...this.globalMiddlewares, ...(options.middlewares ?? [])],
    };
  }

  get(path: string, contextHandler: ContextHandler, options?: RouteOptions) {
    this.router.get(path, contextHandler, this.withGlobals(options));
  }

  post(path: string, contextHandler: ContextHandler, options?: RouteOptions) {
    this.router.post(path, contextHandler, this.withGlobals(options));
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
