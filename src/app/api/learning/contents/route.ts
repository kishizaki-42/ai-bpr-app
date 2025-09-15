import { prisma } from '@/lib/db';
import { jsonError } from '@/lib/errors';
import { jsonOk, preflight } from '@/lib/http';
import { getCache, setCache } from '@/lib/cache';
import type { ApiResponse } from '@/types/api';
import { rateLimitGuard } from '@/lib/ratelimit';

type Content = { id: string; title: string; content_type: string; difficulty: string; estimated_time: number | null };

export async function GET(): Promise<Response /* ApiResponse<Content[]> */> {
  try {
    if (!rateLimitGuard('api:learning:contents')) return jsonOk({ success: false, error: { message: 'Rate limited' } }, 429);
    const cached = getCache<any>('learning:contents');
    if (cached) return jsonOk({ success: true, data: cached });
    const contents = await prisma.learningContent.findMany({ orderBy: { created_at: 'desc' } });
    setCache('learning:contents', contents, 30_000);
    return jsonOk({ success: true, data: contents });
  } catch (e) {
    return jsonError(e);
  }
}

export function OPTIONS() { return preflight(); }
export const dynamic = 'force-dynamic';
