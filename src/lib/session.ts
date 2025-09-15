import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './db';
import { APIError } from './errors';

export async function requireCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new APIError(401, '認証が必要です');
  const email = session.user.email;
  const sessionId = (session.user as any).id as string | undefined;
  if (sessionId) return { id: sessionId, email: email! };
  if (!email) throw new APIError(401, '認証が必要です');
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new APIError(401, 'ユーザーが存在しません');
  return { id: user.id, email: user.email };
}

