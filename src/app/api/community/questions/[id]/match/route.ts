import { prisma } from '@/lib/db';
import { jsonOk, preflight } from '@/lib/http';
import { jsonError, APIError } from '@/lib/errors';
import { requireCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireCurrentUser();
    const q = await (prisma as any).question.findUnique({ where: { id: params.id } });
    if (!q) throw new APIError(404, '質問が見つかりません');

    const tags: string[] = String(q.tags_text || '')
      .split(/[,、\s]+/)
      .map((s: string) => s.trim())
      .filter(Boolean);
    if (!tags.length) return jsonOk({ success: true, data: [] });

    // ユーザースキルからタグに合致するユーザーをスコアリング
    const skills = await prisma.userSkill.findMany({});
    const byUser = new Map<string, { userId: string; score: number; areas: string[] }>();
    for (const s of skills) {
      if (!tags.includes(s.skill_area)) continue;
      const entry = byUser.get(s.user_id) || { userId: s.user_id, score: 0, areas: [] };
      entry.score += (s.level ?? 0) * 2 + (s.experiencePoints ?? 0) / 50; // 簡易スコア
      if (!entry.areas.includes(s.skill_area)) entry.areas.push(s.skill_area);
      byUser.set(s.user_id, entry);
    }
    const candidates = Array.from(byUser.values()).sort((a, b) => b.score - a.score).slice(0, 5);
    const users = await prisma.user.findMany({ where: { id: { in: candidates.map(c => c.userId) } }, select: { id: true, name: true, email: true } });
    const result = candidates.map(c => ({
      id: c.userId,
      name: users.find(u => u.id === c.userId)?.name || 'ユーザー',
      email: users.find(u => u.id === c.userId)?.email || '',
      areas: c.areas,
      score: Math.round(c.score * 10) / 10,
    }));
    return jsonOk({ success: true, data: result });
  } catch (e) {
    return jsonError(e);
  }
}

export function OPTIONS() { return preflight(); }

