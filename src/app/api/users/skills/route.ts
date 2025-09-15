import { prisma } from '@/lib/db';
import { jsonError } from '@/lib/errors';
import { jsonOk, preflight } from '@/lib/http';
import { requireCurrentUser } from '@/lib/session';
import { rateLimitGuard } from '@/lib/ratelimit';
import type { ApiResponse } from '@/types/api';

type Skill = { id: string; user_id: string; skill_area: string; level: number; experiencePoints: number };

export async function GET(): Promise<Response /* ApiResponse<Skill[]> */> {
  try {
    const me = await requireCurrentUser();
    if (!rateLimitGuard(`api:users:skills:${me.id}`)) return jsonOk({ success: false, error: { message: 'Rate limited' } }, 429);
    const skills = await prisma.userSkill.findMany({ where: { user_id: me.id } });
    return jsonOk({ success: true, data: skills });
  } catch (e) {
    return jsonError(e);
  }
}

export function OPTIONS() { return preflight(); }
export const dynamic = 'force-dynamic';
