import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const isHead = request.method === "HEAD";
      const fetchRequest = isHead
        ? new Request(request.url, {
            method: "GET",
            headers: request.headers,
          })
        : request;

      const response = await handler.fetch(fetchRequest, env, ctx);
      const normalizedResponse = await normalizeCatastrophicSsrResponse(response);

      if (isHead) {
        return new Response(null, {
          status: normalizedResponse.status,
          statusText: normalizedResponse.statusText,
          headers: normalizedResponse.headers,
        });
      }

      return normalizedResponse;
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? `${error.name}: ${error.message}\n${error.stack}` : String(error);
      return new Response(
        `<html><body><h1>Server Error</h1><pre>${errorMessage}</pre></body></html>`,
        {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }
      );
    }
  },
};
