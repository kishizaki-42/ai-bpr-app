import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@example.com';
  const name = 'デモユーザー';
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, passwordHash },
  });

  const contents = [
    {
      title: 'BPR基礎入門',
      content_type: 'article',
      difficulty: 'beginner',
      content_data_text: JSON.stringify({ outline: ['BPRとは', 'AI活用の基本'] }),
      ai_topics_text: 'LLM基礎',
      estimated_time: 30,
    },
    {
      title: '現状分析のフレーム',
      content_type: 'exercise',
      difficulty: 'intermediate',
      content_data_text: JSON.stringify({ steps: ['AsIs整理', 'ボトルネック抽出'] }),
      ai_topics_text: 'ベクトル検索',
      estimated_time: 45,
    },
  ];

  for (const c of contents) {
    const existing = await prisma.learningContent.findFirst({
      where: { title: c.title },
    });
    
    if (!existing) {
      await prisma.learningContent.create({
        data: c,
      });
    }
  }

  console.log('Seed completed:', { user: user.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
