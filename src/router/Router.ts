import { type ContextGuard } from "../guards";
import { createRouteHandler } from "./routeHandler";
import {
  HttpMethod,
  type ContextHandler,
  type RequestHandler,
} from "./types";

export class Router {
  routes: Record<string, Partial<Record<HttpMethod, RequestHandler>>> = {};

  private addRoute(
    method: HttpMethod,
    path: string,
    routeHandler: RequestHandler,
  ) {
    if (!this.routes[path]) {
      this.routes[path] = {};
    }
    this.routes[path][method] = routeHandler;
  }

  get(
    path: string,
    contextHandler: ContextHandler,
    guards: ContextGuard[] = [],
  ) {
    const routeHandler = createRouteHandler(contextHandler, guards);
    this.addRoute(HttpMethod.GET, path, routeHandler);
  }

  post(
    path: string,
    contextHandler: ContextHandler,
    guards: ContextGuard[] = [],
  ) {
    const routeHandler = createRouteHandler(contextHandler, guards);
    this.addRoute(HttpMethod.POST, path, routeHandler);
  }
}
