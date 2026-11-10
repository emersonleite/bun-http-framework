import type { BunRequest } from "bun";

export type ContextRequest = BunRequest & {
  query: URLSearchParams;
  pathname: string;
};

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
