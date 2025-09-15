import { prisma } from '@/lib/db';
import { analyzeProcess } from '@/lib/ai';
import { APIError, jsonError } from '@/lib/errors';
import { processAnalyzeSchema } from '@/lib/validators';
import { requireCurrentUser } from '@/lib/session';
import { allow } from '@/lib/ratelimit';
import { jsonOk, preflight } from '@/lib/http';
import type { ApiResponse } from '@/types/api';

type AnalyzePayload = { analysisId: string; result: any };

export async function POST(req: Request): Promise<Response /* ApiResponse<AnalyzePayload> */> {
  try {
    // Support both JSON body and form submission
    let body: any;
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      body = {
        projectId: String(form.get('projectId') || ''),
        process: JSON.parse(String(form.get('process') || '{}')),
      };
    } else {
      body = await req.json();
    }
    const input = processAnalyzeSchema.parse(body);

    const me = await requireCurrentUser();
    const project = await prisma.bPRProject.findUnique({ where: { id: input.projectId } });
    if (!project || project.user_id !== me.id) throw new APIError(404, 'プロジェクトが見つかりません');

    // Rate limit: 5 req / minute per user
    const ok = allow(`analyze:${me.id}`, 5, 60_000);
    if (!ok) throw new APIError(429, 'しばらくしてから再度お試しください（レート制限）', 'RATE_LIMIT');

    // 過去のフィードバックを参照して好みをプロンプトに反映（簡易）
    const fbRows = await (prisma as any).suggestionFeedback.findMany({ where: { user_id: me.id }, orderBy: { created_at: 'desc' }, take: 50 });
    const likes = new Set<string>();
    const dislikes = new Set<string>();
    const adopted = new Set<string>();
    for (const r of fbRows) {
      if (r.rating === 'up') likes.add(r.suggestion_id as string);
      if (r.rating === 'down') dislikes.add(r.suggestion_id as string);
      if (r.adopted) adopted.add(r.suggestion_id as string);
    }
    const prefs: string[] = [];
    if (likes.size) prefs.push(`prefer suggestions similar-to-ids:[${Array.from(likes).join(',')}]`);
    if (dislikes.size) prefs.push(`avoid suggestions similar-to-ids:[${Array.from(dislikes).join(',')}]`);
    if (adopted.size) prefs.push(`prioritize feasibility like ids:[${Array.from(adopted).join(',')}]`);

    const result = await analyzeProcess({ process: input.process, goals: [...(input.goals || []), ...prefs] });
    const saved = await prisma.processAnalysis.create({
      data: {
        project_id: project.id,
        analysis_data_text: JSON.stringify(result),
        ai_confidence_score: result.aiConfidenceScore as any,
      },
    });

    return jsonOk({ success: true, data: { analysisId: saved.id, result } });
  } catch (e) {
    return jsonError(e);
  }
}

export function OPTIONS() { return preflight(); }
export const dynamic = 'force-dynamic';
