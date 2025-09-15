import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { APIError, jsonError } from '@/lib/errors';

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();
    if (!email || !password || !name) throw new APIError(400, '無効な入力です');
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new APIError(409, '既に登録済みのメールアドレスです');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, name, passwordHash } });
    return Response.json({ success: true, data: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
export const dynamic = 'force-dynamic';
