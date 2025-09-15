import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ClientCaseEditor from './client-editor';

export const dynamic = 'force-dynamic';

export default async function CaseDetailPage({ params }: { params: { id: string } }) {
  const row = await (prisma as any).caseStudy.findUnique({ where: { id: params.id } });
  if (!row) return <div className="p-6">事例が見つかりません。</div>;
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || null;
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
  const editable = user?.id === row.user_id;
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-xl font-semibold">{row.title}</h1>
      <div className="text-sm text-slate-600">{new Date(row.created_at).toLocaleString('ja-JP')}</div>
      {row.tags_text && <div className="text-xs text-slate-500">タグ: {row.tags_text}</div>}
      <article className="whitespace-pre-wrap text-slate-800">{row.content}</article>
      {editable && <ClientCaseEditor id={row.id} title={row.title} content={row.content} tags={row.tags_text ?? ''} />}
    </main>
  );
}
