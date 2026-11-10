export type ContextResponse = {
  json: (data: any, status?: number) => Response;
  text: (message: string, status?: number) => Response;
  unauthorized: (message?: string) => Response;
  notFound: (message?: string) => Response;
};
