import { ProjectDetail } from '@/components/ProjectDetail';
import { AnalyzeButton } from '@/components/AnalyzeButton';

import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getProject(id: string) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || null;
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
  if (!user) return null;
  const proj = await prisma.bPRProject.findUnique({ where: { id } });
  if (!proj || proj.user_id !== user.id) return null;
  return proj;
}

async function getAnalyses(projectId: string) {
  const rows = await prisma.processAnalysis.findMany({ where: { project_id: projectId }, orderBy: { created_at: 'desc' } });
  return rows;
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const proj = await getProject(params.id);
  if (!proj) return <div className="p-6">プロジェクトが見つかりません。</div>;
  const analyses = await getAnalyses(params.id);

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <ProjectDetail title={proj.title} description={proj.description ?? undefined} status={proj.status} metrics={proj.metrics_text ? JSON.parse(proj.metrics_text) : null} />
      <AnalyzeButton projectId={proj.id} processJson={proj.current_process_text ?? '{}'} />

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">分析結果</h3>
        {analyses.length === 0 ? (
          <div className="text-slate-600">まだ分析結果がありません。上のボタンで分析を実行してください。</div>
        ) : (
          <ul className="space-y-3">
            {analyses.map((a) => {
              let parsed: any = null;
              try { parsed = JSON.parse(a.analysis_data_text); } catch {}
              const suggestions: any[] = parsed?.improvementSuggestions || [];
              return (
                <li key={a.id} className="rounded border p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{new Date(a.created_at).toLocaleString('ja-JP')}</span>
                    <span className="text-xs rounded bg-slate-100 px-2 py-0.5">信頼度: {String(a.ai_confidence_score ?? '')}</span>
                  </div>
                  {suggestions.length > 0 ? (
                    <ul className="list-disc pl-5 text-sm text-slate-800">
                      {suggestions.slice(0, 3).map((s, i) => (
                        <li key={i}>{s.title}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-slate-600">提案はありません</div>
                  )}
                  <div>
                    <a className="text-xs text-blue-700 hover:underline" href={`/projects/${proj.id}/analyses/${a.id}`}>詳細を見る</a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

export const dynamic = 'force-dynamic';
