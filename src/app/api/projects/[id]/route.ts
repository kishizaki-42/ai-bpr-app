import { prisma } from '@/lib/db';
import { APIError, jsonError } from '@/lib/errors';
import { requireCurrentUser } from '@/lib/session';
import { jsonOk, preflight } from '@/lib/http';
import { rateLimitGuard } from '@/lib/ratelimit';
import { projectUpdateSchema } from '@/lib/validators';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

type Project = { id: string; user_id: string; title: string; description: string | null; status: string };

export async function GET(_req: Request, { params }: { params: { id: string } }): Promise<Response /* ApiResponse<Project> */> {
  try {
    const me = await requireCurrentUser();
    if (!rateLimitGuard(`api:projects:${me.id}`)) return jsonOk({ success: false, error: { message: 'Rate limited' } }, 429);
    const proj = await prisma.bPRProject.findUnique({ where: { id: params.id } });
    if (!proj || proj.user_id !== me.id) throw new APIError(404, 'プロジェクトが見つかりません');
    return jsonOk({ success: true, data: proj });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }): Promise<Response /* ApiResponse<Project> */> {
  try {
    if (!rateLimitGuard(`api:projects:update`, 60, 60_000)) return jsonOk({ success: false, error: { message: 'Rate limited' } }, 429);
    const me = await requireCurrentUser();
    const exists = await prisma.bPRProject.findUnique({ where: { id: params.id } });
    if (!exists || exists.user_id !== me.id) throw new APIError(404, 'プロジェクトが見つかりません');
    const body = projectUpdateSchema.parse(await req.json());
    const updated = await prisma.bPRProject.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
        target_process_text: body.targetProcess ? JSON.stringify(body.targetProcess) : undefined,
        metrics_text: body.metrics ? JSON.stringify(body.metrics) : undefined,
      },
    });
    return jsonOk({ success: true, data: updated });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }): Promise<Response /* ApiResponse<{ success: true }> */> {
  try {
    if (!rateLimitGuard(`api:projects:delete`, 30, 60_000)) return jsonOk({ success: false, error: { message: 'Rate limited' } }, 429);
    const me = await requireCurrentUser();
    const exists = await prisma.bPRProject.findUnique({ where: { id: params.id } });
    if (!exists || exists.user_id !== me.id) throw new APIError(404, 'プロジェクトが見つかりません');
    await prisma.processAnalysis.deleteMany({ where: { project_id: params.id } });
    await prisma.bPRProject.delete({ where: { id: params.id } });
    return jsonOk({ success: true });
  } catch (e) {
    return jsonError(e);
  }
}

export function OPTIONS() { return preflight(); }
