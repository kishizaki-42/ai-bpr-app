import { prisma } from '@/lib/db';
import { APIError, jsonError } from '@/lib/errors';
import { requireCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

function toCSV(rows: string[][]) {
  const esc = (v: string) => '"' + v.replaceAll('"', '""') + '"';
  return rows.map((r) => r.map((c) => esc(c ?? '')).join(',')).join('\n') + '\n';
}

export async function GET(req: Request, { params }: { params: { id: string; analysisId: string } }) {
  try {
    const me = await requireCurrentUser();
    const proj = await prisma.bPRProject.findUnique({ where: { id: params.id } });
    if (!proj || proj.user_id !== me.id) throw new APIError(404, 'プロジェクトが見つかりません');
    const analysis = await prisma.processAnalysis.findUnique({ where: { id: params.analysisId } });
    if (!analysis || analysis.project_id !== proj.id) throw new APIError(404, '分析が見つかりません');
    let parsed: any = null;
    try { parsed = JSON.parse(analysis.analysis_data_text); } catch {}
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'suggestions';

    let csv = '';
    if (type === 'bottlenecks') {
      const header = ['id', 'description', 'severity'];
      const rows = (parsed?.bottlenecks || []).map((b: any) => [b.id, b.description, b.severity]);
      csv = toCSV([header, ...rows]);
    } else if (type === 'inefficiencies') {
      const header = ['id', 'description', 'impact'];
      const rows = (parsed?.inefficiencies || []).map((i: any) => [i.id, i.description, i.impact]);
      csv = toCSV([header, ...rows]);
    } else {
      const header = ['id', 'title', 'description', 'expectedImpact', 'implementationComplexity', 'aiTools', 'estimatedROI'];
      const rows = (parsed?.improvementSuggestions || []).map((s: any) => [
        s.id,
        s.title,
        s.description,
        s.expectedImpact,
        s.implementationComplexity,
        Array.isArray(s.aiTools) ? s.aiTools.join('|') : '',
        s.estimatedROI != null ? String(s.estimatedROI) : '',
      ]);
      csv = toCSV([header, ...rows]);
    }

    const filename = `analysis_${params.analysisId}_${type}.csv`;
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=${filename}`,
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}

