import type { ContextRequest } from "./contextRequest";
import type { ContextResponse } from "./contextResponse";

export type Context = {
  req: ContextRequest;
  res: ContextResponse;
};
