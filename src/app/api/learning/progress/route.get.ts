import { prisma } from '@/lib/db';
import { jsonError } from '@/lib/errors';
import { requireCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const me = await requireCurrentUser();
    const rows = await prisma.userProgress.findMany({ where: { user_id: me.id } });
    return Response.json({ success: true, data: rows });
  } catch (e) {
    return jsonError(e);
  }
}
