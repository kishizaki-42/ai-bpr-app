import { prisma } from '@/lib/db';
import { APIError, jsonError } from '@/lib/errors';
import { jsonOk, preflight } from '@/lib/http';
import type { ApiResponse } from '@/types/api';
import { rateLimitGuard } from '@/lib/ratelimit';

type Content = { id: string; title: string; content_type: string; difficulty: string; estimated_time: number | null };

export async function GET(_req: Request, { params }: { params: { id: string } }): Promise<Response /* ApiResponse<Content> */> {
  try {
    if (!rateLimitGuard('api:learning:content')) return jsonOk({ success: false, error: { message: 'Rate limited' } }, 429);
    const content = await prisma.learningContent.findUnique({ where: { id: params.id } });
    if (!content) throw new APIError(404, 'コンテンツが見つかりません');
    return jsonOk({ success: true, data: content });
  } catch (e) {
    return jsonError(e);
  }
}

export function OPTIONS() { return preflight(); }
export const dynamic = 'force-dynamic';
