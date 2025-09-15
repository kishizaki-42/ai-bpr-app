export class APIError extends Error {
  statusCode: number;
  code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

import { CORS_HEADERS } from './http';

export function jsonError(e: unknown) {
  if (e instanceof APIError) {
    return new Response(JSON.stringify({ success: false, error: { message: e.message, code: e.code } }), {
      status: e.statusCode,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
  console.error(e);
  return new Response(JSON.stringify({ success: false, error: { message: 'Internal Server Error' } }), {
    status: 500,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}
