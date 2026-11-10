import type { BunRequest } from "bun";
import type { Context } from "../context";

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  PUT = "PUT",
  DELETE = "DELETE",
}

export type RequestHandler = (req: BunRequest) => Response | Promise<Response>;

export type ContextHandler = (ctx: Context) => Response | Promise<Response>;
