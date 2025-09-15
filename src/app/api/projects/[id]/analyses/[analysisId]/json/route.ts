import { prisma } from '@/lib/db';
import { APIError, jsonError } from '@/lib/errors';
import { requireCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string; analysisId: string } }) {
  try {
    const me = await requireCurrentUser();
    const proj = await prisma.bPRProject.findUnique({ where: { id: params.id } });
    if (!proj || proj.user_id !== me.id) throw new APIError(404, 'プロジェクトが見つかりません');
    const analysis = await prisma.processAnalysis.findUnique({ where: { id: params.analysisId } });
    if (!analysis || analysis.project_id !== proj.id) throw new APIError(404, '分析が見つかりません');
    let parsed: any = null;
    try { parsed = JSON.parse(analysis.analysis_data_text); } catch { parsed = null; }
    return Response.json({ success: true, data: { id: analysis.id, createdAt: analysis.created_at, aiConfidenceScore: analysis.ai_confidence_score, result: parsed } });
  } catch (e) {
    return jsonError(e);
  }
}

