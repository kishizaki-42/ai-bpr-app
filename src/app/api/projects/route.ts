import { prisma } from '@/lib/db';
import { APIError, jsonError } from '@/lib/errors';
import { projectCreateSchema } from '@/lib/validators';
import { requireCurrentUser } from '@/lib/session';
import { jsonOk, preflight } from '@/lib/http';
import { rateLimitGuard } from '@/lib/ratelimit';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

type Project = { id: string; user_id: string; title: string; description: string | null; status: string };

export async function GET(): Promise<Response /* ApiResponse<Project[]> */> {
  try {
    const me = await requireCurrentUser();
    if (!rateLimitGuard(`api:projects:${me.id}`)) return jsonOk({ success: false, error: { message: 'Rate limited' } }, 429);
    const projects = await prisma.bPRProject.findMany({ where: { user_id: me.id }, orderBy: { created_at: 'desc' } });
    return jsonOk({ success: true, data: projects });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request): Promise<Response /* ApiResponse<Project> */> {
  try {
    const me = await requireCurrentUser();
    if (!rateLimitGuard(`api:projects:${me.id}`)) return jsonOk({ success: false, error: { message: 'Rate limited' } }, 429);
    const raw = await req.json();
    const parsed = projectCreateSchema.parse(raw);
    const created = await prisma.bPRProject.create({
      data: {
        user_id: me.id,
        title: parsed.title,
        description: parsed.description,
        current_process_text: parsed.currentProcess ? JSON.stringify(parsed.currentProcess) : null,
      },
    });
    return jsonOk({ success: true, data: created }, 201);
  } catch (e) {
    return jsonError(e);
  }
}

export function OPTIONS() { return preflight(); }
