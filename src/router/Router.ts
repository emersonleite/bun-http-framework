import { createRouteHandler } from "./routeHandler";
import {
  HttpMethod,
  type ContextHandler,
  type RequestHandler,
  type RouteOptions,
} from "./types";

export class Router {
  routes: Record<string, Partial<Record<HttpMethod, RequestHandler>>> = {};

  private addRoute(
    method: HttpMethod,
    path: string,
    contextHandler: ContextHandler,
    options?: RouteOptions,
  ) {
    this.routes[path] ??= {};
    this.routes[path][method] = createRouteHandler(contextHandler, options);
  }

  get(path: string, contextHandler: ContextHandler, options?: RouteOptions) {
    this.addRoute(HttpMethod.GET, path, contextHandler, options);
  }

  post(path: string, contextHandler: ContextHandler, options?: RouteOptions) {
    this.addRoute(HttpMethod.POST, path, contextHandler, options);
  }
}
