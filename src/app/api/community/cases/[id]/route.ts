import { prisma } from '@/lib/db';
import { jsonOk, preflight } from '@/lib/http';
import { jsonError, APIError } from '@/lib/errors';
import { requireCurrentUser } from '@/lib/session';
import { caseUpdateSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const row = await (prisma as any).caseStudy.findUnique({ where: { id: params.id } });
    if (!row) throw new APIError(404, '事例が見つかりません');
    return jsonOk({ success: true, data: row });
  } catch (e) { return jsonError(e); }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await requireCurrentUser();
    const row = await (prisma as any).caseStudy.findUnique({ where: { id: params.id } });
    if (!row || row.user_id !== me.id) throw new APIError(404, '更新権限がありません');
    const b = caseUpdateSchema.parse(await req.json());
    const tags = Array.isArray(b.tags) ? b.tags.join(',') : (typeof b.tags === 'string' ? b.tags : undefined);
    const saved = await (prisma as any).caseStudy.update({ where: { id: params.id }, data: { title: b.title ?? row.title, content: b.content ?? row.content, ...(tags !== undefined ? { tags_text: tags } : {}) } });
    return jsonOk({ success: true, data: saved });
  } catch (e) { return jsonError(e); }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await requireCurrentUser();
    const row = await (prisma as any).caseStudy.findUnique({ where: { id: params.id } });
    if (!row || row.user_id !== me.id) throw new APIError(404, '削除権限がありません');
    await (prisma as any).caseStudy.delete({ where: { id: params.id } });
    return jsonOk({ success: true });
  } catch (e) { return jsonError(e); }
}

export function OPTIONS() { return preflight(); }
