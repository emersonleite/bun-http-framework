import type { BunRequest } from "bun";

export type RequestHandler = (req: BunRequest) => Response | Promise<Response>;
