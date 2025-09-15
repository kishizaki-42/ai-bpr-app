import { prisma } from '@/lib/db';
import { jsonOk, preflight } from '@/lib/http';
import { jsonError } from '@/lib/errors';
import { requireCurrentUser } from '@/lib/session';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

function ym(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

type Series = { period: string; projectsCreated: number; projectsCompleted: number; learningCompleted: number };

export async function GET(): Promise<Response /* ApiResponse<{ series: Series[] }> */> {
  try {
    const me = await requireCurrentUser();
    const now = new Date();
    const months = 6; // last 6 months
    const from = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    // Fetch relevant rows
    const [projects, completedProjects, progresses] = await Promise.all([
      prisma.bPRProject.findMany({ where: { user_id: me.id, created_at: { gte: from } }, select: { created_at: true } }),
      prisma.bPRProject.findMany({ where: { user_id: me.id, status: 'evaluation', updated_at: { gte: from } }, select: { updated_at: true } }),
      prisma.userProgress.findMany({ where: { user_id: me.id, completed_at: { not: null, gte: from } }, select: { completed_at: true } }),
    ]);

    const periods: string[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      periods.push(ym(d));
    }

    const makeCountMap = (dates: (Date | null | undefined)[]) => {
      const m = new Map<string, number>();
      for (const p of periods) m.set(p, 0);
      for (const d of dates) {
        if (!d) continue;
        const key = ym(new Date(d));
        if (m.has(key)) m.set(key, (m.get(key) || 0) + 1);
      }
      return m;
    };

    const createdMap = makeCountMap(projects.map((p) => p.created_at));
    const completedMap = makeCountMap(completedProjects.map((p) => p.updated_at));
    const learningMap = makeCountMap(progresses.map((x) => x.completed_at));

    const series = periods.map((p) => ({ period: p, projectsCreated: createdMap.get(p) || 0, projectsCompleted: completedMap.get(p) || 0, learningCompleted: learningMap.get(p) || 0 }));

    return jsonOk({ success: true, data: { series } });
  } catch (e) {
    return jsonError(e);
  }
}

export function OPTIONS() { return preflight(); }
