import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { SuggestionFeedbackPanel } from '@/components/SuggestionFeedbackPanel';

export const dynamic = 'force-dynamic';

async function getData(projectId: string, analysisId: string) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || null;
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
  if (!user) return null;
  const proj = await prisma.bPRProject.findUnique({ where: { id: projectId } });
  if (!proj || proj.user_id !== user.id) return null;
  const a = await prisma.processAnalysis.findUnique({ where: { id: analysisId } });
  if (!a || a.project_id !== proj.id) return null;
  let parsed: any = null;
  try { parsed = JSON.parse(a.analysis_data_text); } catch {}
  return { project: proj, analysis: a, parsed };
}

export default async function AnalysisDetailPage({ params }: { params: { id: string; analysisId: string } }) {
  const data = await getData(params.id, params.analysisId);
  if (!data) return <div className="p-6">分析が見つかりません。</div>;

  const { project, analysis, parsed } = data;

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <div className="space-y-1">
        <Link href={`/projects/${project.id}`} className="text-sm text-blue-700 hover:underline">
          ← プロジェクトへ戻る
        </Link>
        <h1 className="text-xl font-semibold">分析詳細</h1>
        <div className="text-sm text-slate-600">{new Date(analysis.created_at).toLocaleString('ja-JP')}・信頼度: {String(analysis.ai_confidence_score ?? '')}</div>
      </div>

      <div className="flex flex-wrap gap-2">
        <a className="rounded border px-3 py-1.5 text-sm" href={`/api/projects/${project.id}/analyses/${analysis.id}/json`}>
          JSONをダウンロード
        </a>
        <a className="rounded border px-3 py-1.5 text-sm" href={`/api/projects/${project.id}/analyses/${analysis.id}/csv?type=suggestions`}>
          提案CSV
        </a>
        <a className="rounded border px-3 py-1.5 text-sm" href={`/api/projects/${project.id}/analyses/${analysis.id}/csv?type=bottlenecks`}>
          ボトルネックCSV
        </a>
        <a className="rounded border px-3 py-1.5 text-sm" href={`/api/projects/${project.id}/analyses/${analysis.id}/csv?type=inefficiencies`}>
          非効率CSV
        </a>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">改善提案</h2>
        {parsed?.improvementSuggestions?.length ? (
          <ul className="space-y-2">
            {parsed.improvementSuggestions.map((s: any) => (
              <li key={s.id} className="rounded border p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{s.title}</div>
                  <div className="text-xs rounded bg-slate-100 px-2 py-0.5">影響: {s.expectedImpact} / 実装: {s.implementationComplexity}</div>
                </div>
                <p className="text-sm text-slate-700">{s.description}</p>
                <div className="text-xs text-slate-600">ツール: {(Array.isArray(s.aiTools) ? s.aiTools.join(', ') : '')} {s.estimatedROI != null ? ` / ROI: ${s.estimatedROI}` : ''}</div>
                <SuggestionFeedbackPanel projectId={project.id} analysisId={analysis.id} suggestionId={s.id} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-slate-600">提案はありません。</div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">ボトルネック</h2>
        {parsed?.bottlenecks?.length ? (
          <ul className="list-disc pl-5 text-sm text-slate-800">
            {parsed.bottlenecks.map((b: any) => (
              <li key={b.id}>{b.description}（重大度: {b.severity}）</li>
            ))}
          </ul>
        ) : (
          <div className="text-slate-600">なし</div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">非効率</h2>
        {parsed?.inefficiencies?.length ? (
          <ul className="list-disc pl-5 text-sm text-slate-800">
            {parsed.inefficiencies.map((i: any) => (
              <li key={i.id}>{i.description}（影響: {i.impact}）</li>
            ))}
          </ul>
        ) : (
          <div className="text-slate-600">なし</div>
        )}
      </section>
    </main>
  );
}
