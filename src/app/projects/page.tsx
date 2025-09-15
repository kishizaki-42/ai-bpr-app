"use client";
import { ProjectForm } from '@/components/ProjectForm';
import { ProjectList } from '@/components/ProjectList';
import { ProjectWizard } from '@/components/ProjectWizard';
import { useEffect, useState } from 'react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/projects', { cache: 'no-store' });
    if (!res.ok) {
      setError('読み込みに失敗しました');
    } else {
      const json = await res.json();
      setProjects(json.data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(data: { title: string; description?: string }) {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: data.title, description: data.description }),
    });
    if (res.ok) await load();
  }

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">プロジェクト</h1>
      <section className="rounded border p-4">
        <h2 className="font-semibold mb-2">新規作成（ウィザード）</h2>
        <ProjectWizard onCreated={load} />
      </section>
      <section className="rounded border p-4">
        <h2 className="font-semibold mb-2">一覧</h2>
        <div className="mb-3 flex items-center gap-2 text-sm">
          <label className="text-slate-600">ステータス</label>
          <select className="rounded border p-1.5" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">すべて</option>
            <option value="planning">planning</option>
            <option value="analysis">analysis</option>
            <option value="design">design</option>
            <option value="implementation">implementation</option>
            <option value="evaluation">evaluation</option>
          </select>
        </div>
        {loading ? (
          <div className="text-slate-600">読み込み中...</div>
        ) : error ? (
          <div className="text-red-700">{error}</div>
        ) : (
          <ProjectList projects={projects.filter((p) => statusFilter === 'all' ? true : p.status === statusFilter)} onChanged={load} />
        )}
      </section>
    </main>
  );
}
