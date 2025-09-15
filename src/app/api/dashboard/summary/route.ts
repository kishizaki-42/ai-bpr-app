import { prisma } from '@/lib/db';
import { jsonError } from '@/lib/errors';
import { jsonOk, preflight } from '@/lib/http';
import { getCache, setCache } from '@/lib/cache';
import { rateLimitGuard } from '@/lib/ratelimit';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

type Summary = {
  learningProgress: { completedCourses: number; totalCourses: number; currentSkillLevel: number; skillBreakdown: Array<{ area: string; level: number; xp: number }> };
  projectProgress: { activeProjects: number; completedProjects: number; totalImpactScore: number; metricsBreakdown: Record<string, number> };
  achievements: any[];
};

export async function GET(): Promise<Response /* ApiResponse<Summary> */> {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return jsonOk({
        success: true,
        data: {
          learningProgress: { completedCourses: 0, totalCourses: 0, currentSkillLevel: 0, skillBreakdown: [] },
          projectProgress: { activeProjects: 0, completedProjects: 0, totalImpactScore: 0 },
          achievements: [],
        },
      });
    }

    // Simple per-user rate limit
    if (!rateLimitGuard(`api:summary:${user.id}`, 60, 60_000)) {
      return jsonOk({ success: false, error: { message: 'Rate limited' } }, 429);
    }

    const cached = getCache<any>(`summary:${user.id}`);
    if (cached) return jsonOk({ success: true, data: cached });

    const [totalCourses, completedCourses, skills, activeProjects, completedProjects, projectsWithMetrics] = await Promise.all([
      prisma.learningContent.count(),
      prisma.userProgress.count({ where: { user_id: user.id, status: 'completed' } }),
      prisma.userSkill.findMany({ where: { user_id: user.id } }),
      prisma.bPRProject.count({ where: { user_id: user.id, NOT: { status: 'evaluation' } } }),
      prisma.bPRProject.count({ where: { user_id: user.id, status: 'evaluation' } }),
      prisma.bPRProject.findMany({ where: { user_id: user.id, NOT: { metrics_text: null } }, select: { metrics_text: true } }),
    ]);

    const totals = { timeReduction: 0, costSaving: 0, qualityImprovement: 0, customerSatisfaction: 0 } as Record<string, number>;
    const totalImpactScore = projectsWithMetrics.reduce((sum, p) => {
      try {
        const m = p.metrics_text ? JSON.parse(p.metrics_text) : {};
        const { timeReduction = 0, costSaving = 0, qualityImprovement = 0, customerSatisfaction = 0, impactScore = 0 } = m || {};
        totals.timeReduction += Number(timeReduction) || 0;
        totals.costSaving += Number(costSaving) || 0;
        totals.qualityImprovement += Number(qualityImprovement) || 0;
        totals.customerSatisfaction += Number(customerSatisfaction) || 0;
        const local = Number(impactScore) || (Number(timeReduction) + Number(costSaving) + Number(qualityImprovement) + Number(customerSatisfaction));
        return sum + (Number.isFinite(local) ? local : 0);
      } catch {
        return sum;
      }
    }, 0);

    const data = {
      learningProgress: {
        completedCourses,
        totalCourses,
        currentSkillLevel: user.skill_level,
        skillBreakdown: skills.map((s) => ({ area: s.skill_area, level: s.level, xp: s.experiencePoints })),
      },
      projectProgress: {
        activeProjects,
        completedProjects,
        totalImpactScore,
        metricsBreakdown: totals,
      },
      achievements: [],
    };
    setCache(`summary:${user.id}`, data, 30_000);
    return jsonOk({ success: true, data });
  } catch (e) {
    return jsonError(e);
  }
}

export function OPTIONS() { return preflight(); }
