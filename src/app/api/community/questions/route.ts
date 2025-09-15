import { prisma } from '@/lib/db';
import { jsonOk, preflight } from '@/lib/http';
import { jsonError } from '@/lib/errors';
import { requireCurrentUser } from '@/lib/session';
import { rateLimitGuard } from '@/lib/ratelimit';
import { questionCreateSchema } from '@/lib/validators';
import { getCache, setCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').toLowerCase();
    const cacheKey = `questions:list:${q}`;
    const cached = getCache<any>(cacheKey);
    if (cached) return jsonOk({ success: true, data: cached });
    const rows = await (prisma as any).question.findMany({ orderBy: { created_at: 'desc' }, take: 50 });
    const filtered = q ? rows.filter((r: any) => (r.title as string).toLowerCase().includes(q) || (r.body as string).toLowerCase().includes(q) || (r.tags_text || '').toLowerCase().includes(q)) : rows;
    setCache(cacheKey, filtered, 30_000);
    return jsonOk({ success: true, data: filtered });
  } catch (e) { return jsonError(e); }
}

export async function POST(req: Request) {
  try {
    const me = await requireCurrentUser();
    if (!rateLimitGuard(`api:questions:${me.id}`, 30, 60_000)) return jsonOk({ success: false, error: { message: 'Rate limited' } }, 429);
    const b = questionCreateSchema.parse(await req.json());
    const tags = Array.isArray(b.tags) ? b.tags.join(',') : String(b.tags || '');
    const saved = await (prisma as any).question.create({ data: { user_id: me.id, title: b.title, body: b.body, tags_text: tags } });
    return jsonOk({ success: true, data: saved }, 201);
  } catch (e) { return jsonError(e); }
}

export function OPTIONS() { return preflight(); }
