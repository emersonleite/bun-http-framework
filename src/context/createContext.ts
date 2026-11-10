import type { BunRequest } from "bun";
import type { Context } from "./types";
import { buildContextRequest } from "./buildContextRequest";
import { buildContextResponse } from "./buildContextResponse";

export async function createContext(req: BunRequest): Promise<Context> {
  return {
    req: await buildContextRequest(req),
    res: buildContextResponse(),
  };
}
