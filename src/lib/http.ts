const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function jsonOk(body: any, init: number | ResponseInit = 200) {
  const status = typeof init === 'number' ? init : init.status ?? 200;
  const headers = new Headers(typeof init === 'number' ? undefined : init.headers);
  headers.set('Content-Type', 'application/json');
  Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v));
  return new Response(JSON.stringify(body), { status, headers });
}

export function preflight() {
  const headers = new Headers(CORS_HEADERS);
  return new Response(null, { status: 204, headers });
}

export { CORS_HEADERS };

