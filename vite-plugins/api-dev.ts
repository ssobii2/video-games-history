import type { Plugin } from 'vite';
import { loadEnv } from 'vite';

const ENV_KEYS = [
  'DATABASE_URL',
  'DATABASE_URL_UNPOOLED',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'SEED_TOKEN',
] as const;

export function apiDevServer(): Plugin {
  const configureServer: Plugin['configureServer'] = (server) => {
    const env = loadEnv(server.config.mode, server.config.root, '');
    for (const k of ENV_KEYS) {
      if (env[k] && !process.env[k]) {
        process.env[k] = env[k];
      }
    }

    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url ?? '/', 'http://localhost');
      if (url.pathname !== '/api/museum' && url.pathname !== '/api/seed') {
        next();
        return;
      }

      const vReq = {
        method: req.method,
        query: Object.fromEntries(url.searchParams),
        headers: req.headers,
        cookies: {},
        body: undefined,
      } as unknown as import('@vercel/node').VercelRequest;

      let statusCode = 200;
      const vRes = {
        setHeader: (k: string, v: string) => {
          res.setHeader(k, v);
          return vRes;
        },
        status: (code: number) => {
          statusCode = code;
          return vRes;
        },
        json: (obj: unknown) => {
          res.statusCode = statusCode;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(obj));
          return vRes;
        },
        send: (data: unknown) => {
          res.statusCode = statusCode;
          res.end(typeof data === 'string' ? data : JSON.stringify(data));
          return vRes;
        },
        end: (data?: unknown) => {
          res.statusCode = statusCode;
          res.end(data as any);
          return vRes;
        },
      } as unknown as import('@vercel/node').VercelResponse;

      const modPath =
        url.pathname === '/api/seed' ? '/api/seed.ts' : '/api/museum.ts';

      try {
        const mod = await server.ssrLoadModule(modPath);
        await (mod.default as (q: any, s: any) => Promise<void>)(vReq, vRes);
      } catch (err) {
        server.config.logger.error(
          '[api-dev] ' +
            (err instanceof Error ? err.stack ?? err.message : String(err))
        );
        if (!res.writableEnded) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: 'api-dev handler failed',
              detail: err instanceof Error ? err.message : String(err),
            })
          );
        }
      }
    });
  };

  return { name: 'api-dev-server', configureServer };
}
