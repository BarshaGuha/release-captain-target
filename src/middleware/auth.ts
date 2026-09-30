import type { Context, Next } from 'hono';

// Simple shared-secret auth for write operations. Real deployments set
// API_KEY in the environment; if it's unset (e.g. a fresh local checkout
// with no .env yet) we don't lock the developer out, but we do log a
// warning so it's obvious this isn't safe for anything but local dev.
export async function requireApiKey(c: Context, next: Next) {
  const expected = process.env.API_KEY;

  if (!expected) {
    console.warn('[auth] API_KEY is not set — write endpoints are UNPROTECTED. Set API_KEY before deploying.');
    return next();
  }

  const provided = c.req.header('x-api-key');
  if (provided !== expected) {
    return c.json({ error: 'Unauthorized: missing or invalid x-api-key header' }, 401);
  }

  return next();
}
