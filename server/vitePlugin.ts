import { lookup } from 'node:dns/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { handlePageRequest } from './pageProxy.ts';

/** Where the dev and preview servers serve the page endpoint. Matches VITE_PAGE_ENDPOINT in .env.development. */
export const PAGE_ENDPOINT = '/api/page';

async function resolve(hostname: string): Promise<string[]> {
  return (await lookup(hostname, { all: true })).map((entry) => entry.address);
}

/** Serve the page endpoint from `vite dev` and `vite preview`, so link import works locally. */
export function pageProxy(): Plugin {
  const middleware = (
    incoming: IncomingMessage & { originalUrl?: string },
    outgoing: ServerResponse,
    next: (error?: unknown) => void,
  ) => {
    const headers = new Headers();
    for (const [name, value] of Object.entries(incoming.headers)) {
      if (typeof value === 'string') headers.set(name, value);
    }
    const url = new URL(incoming.originalUrl ?? incoming.url ?? '/', 'http://localhost');
    handlePageRequest(new Request(url, { method: incoming.method, headers }), { resolve })
      .then(async (response) => {
        outgoing.statusCode = response.status;
        response.headers.forEach((value, name) => outgoing.setHeader(name, value));
        outgoing.end(Buffer.from(await response.arrayBuffer()));
      })
      .catch(next);
  };

  return {
    name: 'speed-reader:page-proxy',
    configureServer(server) {
      server.middlewares.use(PAGE_ENDPOINT, middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(PAGE_ENDPOINT, middleware);
    },
  };
}
