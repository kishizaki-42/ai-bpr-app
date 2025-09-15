import { prisma } from '@/lib/db';
import { jsonOk, preflight } from '@/lib/http';
import { jsonError, APIError } from '@/lib/errors';
import { requireCurrentUser } from '@/lib/session';
import { answerCreateSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const q = await (prisma as any).question.findUnique({ where: { id: params.id } });
    if (!q) throw new APIError(404, '質問が見つかりません');
    const answers = await (prisma as any).answer.findMany({ where: { question_id: params.id }, orderBy: { created_at: 'asc' } });
    return jsonOk({ success: true, data: { question: q, answers } });
  } catch (e) { return jsonError(e); }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await requireCurrentUser();
    const q = await (prisma as any).question.findUnique({ where: { id: params.id } });
    if (!q) throw new APIError(404, '質問が見つかりません');
    const b = answerCreateSchema.parse(await req.json());
    const saved = await (prisma as any).answer.create({ data: { question_id: q.id, user_id: me.id, body: b.body } });
    return jsonOk({ success: true, data: saved }, 201);
  } catch (e) { return jsonError(e); }
}

export function OPTIONS() { return preflight(); }
