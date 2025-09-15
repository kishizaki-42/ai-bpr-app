import { DashboardLayout } from '@/components/DashboardLayout';
import dynImport from 'next/dynamic';
const ProgressDonut = dynImport(() => import('@/components/charts/ProgressDonut').then(m => m.ProgressDonut), { ssr: false });
const SkillBar = dynImport(() => import('@/components/charts/SkillBar').then(m => m.SkillBar), { ssr: false });
const ImpactBreakdown = dynImport(() => import('@/components/charts/ImpactBreakdown').then(m => m.ImpactBreakdown), { ssr: false });
const TimelineChart = dynImport(() => import('@/components/charts/TimelineChart').then(m => m.TimelineChart), { ssr: false });

export const dynamic = 'force-dynamic';

async function fetchDashboard() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/dashboard/summary`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data as {
    learningProgress: { completedCourses: number; totalCourses: number; currentSkillLevel: number };
    projectProgress: { activeProjects: number; completedProjects: number; totalImpactScore: number };
  };
}

async function fetchTimeline() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/dashboard/timeline`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data as { series: Array<{ period: string; projectsCreated: number; projectsCompleted: number; learningCompleted: number }> };
}

export default async function DashboardPage() {
  const [data, timeline] = await Promise.all([fetchDashboard(), fetchTimeline()]);
  return (
    <DashboardLayout title="ダッシュボード">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card title="学習完了" value={data ? `${data.learningProgress.completedCourses}/${data.learningProgress.totalCourses}` : '—'} />
        <Card title="スキルレベル" value={data ? String(data.learningProgress.currentSkillLevel) : '—'} />
        <Card title="アクティブPJ" value={data ? String(data.projectProgress.activeProjects) : '—'} />
        <Card title="完了PJ" value={data ? String(data.projectProgress.completedProjects) : '—'} />
      </div>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="rounded border p-4">
            <div className="font-semibold mb-2">学習完了状況</div>
            <ProgressDonut completed={data.learningProgress.completedCourses} total={data.learningProgress.totalCourses} />
          </div>
          <div className="rounded border p-4">
            <div className="font-semibold mb-2">スキル内訳</div>
            <SkillBar items={(data as any).learningProgress.skillBreakdown || []} />
          </div>
          <div className="rounded border p-4">
            <div className="font-semibold mb-2">成果指標内訳</div>
            <ImpactBreakdown data={(data as any).projectProgress.metricsBreakdown || { timeReduction:0, costSaving:0, qualityImprovement:0, customerSatisfaction:0 }} />
          </div>
          <div className="rounded border p-4 lg:col-span-2">
            <div className="font-semibold mb-2">活動の推移（6ヶ月）</div>
            <TimelineChart data={timeline?.series || []} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded border p-4">
      <div className="text-sm text-slate-600">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
