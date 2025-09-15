import { prisma } from '@/lib/db';
import { APIError, jsonError } from '@/lib/errors';
import { jsonOk, preflight } from '@/lib/http';
import { updateProfileSchema } from '@/lib/validators';
import { rateLimitGuard } from '@/lib/ratelimit';
import type { ApiResponse } from '@/types/api';
import { requireCurrentUser } from '@/lib/session';

type Profile = { id: string; email: string; name: string; role: string; skill_level: number };

export async function GET(): Promise<Response /* ApiResponse<Profile> */> {
  try {
    const me = await requireCurrentUser();
    if (!rateLimitGuard(`api:users:profile:${me.id}`)) return jsonOk({ success: false, error: { message: 'Rate limited' } }, 429);
    const user = await prisma.user.findUnique({ where: { id: me.id } });
    if (!user) throw new APIError(404, 'ユーザーが見つかりません');
    return jsonOk({ success: true, data: { id: user.id, email: user.email, name: user.name, role: user.role, skill_level: user.skill_level } });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PUT(req: Request): Promise<Response /* ApiResponse<Pick<Profile,'id'|'email'|'name'>> */> {
  try {
    const body = await req.json();
    const { name } = updateProfileSchema.parse(body);
    const me = await requireCurrentUser();
    if (!rateLimitGuard(`api:users:profile:${me.id}`)) return jsonOk({ success: false, error: { message: 'Rate limited' } }, 429);
    const updated = await prisma.user.update({ where: { id: me.id }, data: { name } });
    return jsonOk({ success: true, data: { id: updated.id, email: updated.email, name: updated.name } });
  } catch (e) {
    return jsonError(e);
  }
}

export function OPTIONS() {
  return preflight();
}
export const dynamic = 'force-dynamic';
