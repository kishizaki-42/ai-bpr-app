import { prisma } from '@/lib/db';
import { APIError, jsonError } from '@/lib/errors';
import { learningProgressSchema } from '@/lib/validators';
import { requireCurrentUser } from '@/lib/session';
import { jsonOk, preflight } from '@/lib/http';
import { rateLimitGuard } from '@/lib/ratelimit';
import type { ApiResponse } from '@/types/api';

type Progress = { id: string; user_id: string; content_id: string; status: string; completion_rate: any; skill_points: number };

export async function POST(req: Request): Promise<Response /* ApiResponse<Progress> */> {
  try {
    const body = await req.json();
    const input = learningProgressSchema.parse(body);
    const me = await requireCurrentUser();

    if (!rateLimitGuard(`api:learning:progress:${me.id}`, 120, 60_000)) return jsonOk({ success: false, error: { message: 'Rate limited' } }, 429);
    const now = new Date();
    const isCompleted = (input.status === 'completed') || ((input.completionRate ?? 0) >= 100);
    const progress = await prisma.userProgress.upsert({
      where: { user_id_content_id: { user_id: me.id, content_id: input.contentId } },
      update: {
        status: input.status,
        completion_rate: input.completionRate?.toString() as any,
        skill_points: input.skillPoints,
        updated_at: now,
        ...(isCompleted ? { completed_at: now } : {}),
      },
      create: {
        user_id: me.id,
        content_id: input.contentId,
        status: input.status ?? (isCompleted ? 'completed' : 'in-progress'),
        completion_rate: (input.completionRate ?? (isCompleted ? 100 : 0)).toString() as any,
        skill_points: input.skillPoints ?? 0,
        started_at: now,
        updated_at: now,
        ...(isCompleted ? { completed_at: now } : {}),
      },
    });

    // スキルポイント反映（完了時に付与）
    if (isCompleted) {
      const content = await prisma.learningContent.findUnique({ where: { id: input.contentId } });
      const tagsText = (content as any)?.ai_topics_text as string | undefined;
      const tags = (tagsText || '').split(/[,、\s]+/).map(s => s.trim()).filter(Boolean);
      const points = input.skillPoints ?? progress.skill_points ?? 0;
      if (tags.length && points > 0) {
        for (const area of tags) {
          const current = await prisma.userSkill.findFirst({ where: { user_id: me.id, skill_area: area } });
          if (current) {
            const xp = (current.experiencePoints ?? 0) + points;
            const level = Math.floor(xp / 100);
            await prisma.userSkill.update({ where: { id: current.id }, data: { experiencePoints: xp, level } });
          } else {
            await prisma.userSkill.create({ data: { user_id: me.id, skill_area: area, experiencePoints: points, level: Math.floor(points / 100) } });
          }
        }
        // ユーザー全体のスキルレベルを最大レベルで更新
        const all = await prisma.userSkill.findMany({ where: { user_id: me.id } });
        const maxLevel = all.reduce((m, s) => Math.max(m, s.level ?? 0), 0);
        await prisma.user.update({ where: { id: me.id }, data: { skill_level: maxLevel } });
      }
    }
    return jsonOk({ success: true, data: progress });
  } catch (e) {
    return jsonError(e);
  }
}

export function OPTIONS() { return preflight(); }

export { GET } from './route.get';
export const dynamic = 'force-dynamic';
