import { prisma } from '@/lib/db';
import { APIError, jsonError } from '@/lib/errors';
import { requireCurrentUser } from '@/lib/session';
import { jsonOk, preflight } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string; analysisId: string } }) {
  try {
    const me = await requireCurrentUser();
    const proj = await prisma.bPRProject.findUnique({ where: { id: params.id } });
    if (!proj || proj.user_id !== me.id) throw new APIError(404, 'プロジェクトが見つかりません');
    const analysis = await prisma.processAnalysis.findUnique({ where: { id: params.analysisId } });
    if (!analysis || analysis.project_id !== proj.id) throw new APIError(404, '分析が見つかりません');

    const rows = await (prisma as any).suggestionFeedback.findMany({ where: { analysis_id: analysis.id } });
    const mine = await (prisma as any).suggestionFeedback.findMany({ where: { analysis_id: analysis.id, user_id: me.id } });

    const summary: Record<string, { up: number; down: number; adopted: number }> = {};
    for (const r of rows) {
      const k = r.suggestion_id as string;
      if (!summary[k]) summary[k] = { up: 0, down: 0, adopted: 0 };
      if (r.rating === 'up') summary[k].up++;
      if (r.rating === 'down') summary[k].down++;
      if (r.adopted) summary[k].adopted++;
    }

    return jsonOk({ success: true, data: { summary, mine } });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request, { params }: { params: { id: string; analysisId: string } }) {
  try {
    const me = await requireCurrentUser();
    const proj = await prisma.bPRProject.findUnique({ where: { id: params.id } });
    if (!proj || proj.user_id !== me.id) throw new APIError(404, 'プロジェクトが見つかりません');
    const analysis = await prisma.processAnalysis.findUnique({ where: { id: params.analysisId } });
    if (!analysis || analysis.project_id !== proj.id) throw new APIError(404, '分析が見つかりません');
    const body = await req.json();
    const suggestionId = String(body.suggestionId || '');
    const rating = body.rating === 'up' || body.rating === 'down' ? body.rating : undefined;
    const adopted = Boolean(body.adopted);
    if (!suggestionId) throw new APIError(400, 'suggestionId が必要です');

    const existing = await (prisma as any).suggestionFeedback.findFirst({ where: { user_id: me.id, analysis_id: analysis.id, suggestion_id: suggestionId } });
    let saved;
    if (existing) {
      saved = await (prisma as any).suggestionFeedback.update({ where: { id: existing.id }, data: { rating, adopted } });
    } else {
      saved = await (prisma as any).suggestionFeedback.create({ data: { user_id: me.id, analysis_id: analysis.id, suggestion_id: suggestionId, rating, adopted } });
    }

    return jsonOk({ success: true, data: saved }, 201);
  } catch (e) {
    return jsonError(e);
  }
}

export function OPTIONS() { return preflight(); }

