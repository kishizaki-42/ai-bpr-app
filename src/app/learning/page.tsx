import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { LearningList } from '@/components/LearningList';

export const dynamic = 'force-dynamic';

export default async function LearningPage() {
  const contents = await prisma.learningContent.findMany({ orderBy: { created_at: 'desc' } });
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || null;
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
  const progress = user ? await prisma.userProgress.findMany({ where: { user_id: user.id } }) : [];
  const skills = user ? await prisma.userSkill.findMany({ where: { user_id: user.id } }) : [];

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">学習コンテンツ</h1>
      <LearningList
        contents={contents.map((c) => ({ id: c.id, title: c.title, difficulty: c.difficulty as any, ai_topics_text: (c as any).ai_topics_text, estimated_time: (c as any).estimated_time }))}
        progress={progress.map((p) => ({ content_id: p.content_id, completion_rate: (p.completion_rate as any) ?? 0, status: p.status, skill_points: p.skill_points }))}
        skills={skills.map((s)=> ({ area: s.skill_area, level: s.level, xp: s.experiencePoints }))}
      />
    </main>
  );
}
