import type { BunRequest } from "bun";

export type ContextRequest = BunRequest & {
  query: URLSearchParams;
  pathname: string;
};

export type ContextGuard = (ctx: Context) => Response | null;

export type RequestHandler = (req: BunRequest) => Response | Promise<Response>;

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  PUT = "PUT",
  DELETE = "DELETE",
}

export type ContextResponse = {
  json: (data: any, status?: number) => Response;
  text: (message: string, status?: number) => Response;
  unauthorized: (message?: string) => Response;
  notFound: (message?: string) => Response;
};

export type Context = {
  req: ContextRequest;
  res: ContextResponse;
};

export type ContextHandler = (ctx: Context) => Response | Promise<Response>;
