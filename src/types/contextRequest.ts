import type { BunRequest } from "bun";

export type ContextRequest = BunRequest & {
  query: URLSearchParams;
  pathname: string;
};
