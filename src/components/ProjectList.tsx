"use client";
import Link from 'next/link';
import { useState } from 'react';

type Project = { id: string; title: string; status: string; description?: string };

export function ProjectList({ projects = [], onChanged }: { projects: Project[]; onChanged?: () => void | Promise<void> }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ title: string; description?: string; status: string } | null>(null);
  const statuses = ['planning', 'analysis', 'design', 'implementation', 'evaluation'] as const;

  if (!projects.length) return <div className="text-slate-600">プロジェクトはまだありません。</div>;

  const startEdit = (p: Project) => {
    setEditingId(p.id);
    setDraft({ title: p.title, description: p.description, status: p.status });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  async function save(id: string) {
    if (!draft) return;
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    if (res.ok) {
      await onChanged?.();
      cancelEdit();
    }
  }

  async function remove(id: string) {
    if (!confirm('削除してよろしいですか？この操作は元に戻せません。')) return;
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) await onChanged?.();
  }

  return (
    <ul className="space-y-2">
      {projects.map((p) => (
        <li key={p.id} className="rounded border p-3 space-y-2">
          {editingId === p.id ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <input className="w-full rounded border p-2" value={draft?.title || ''} onChange={(e) => setDraft((d) => ({ ...(d as any), title: e.target.value }))} />
                <select className="rounded border p-2" value={draft?.status || ''} onChange={(e) => setDraft((d) => ({ ...(d as any), status: e.target.value }))}>
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <textarea className="w-full rounded border p-2" placeholder="説明" value={draft?.description || ''} onChange={(e) => setDraft((d) => ({ ...(d as any), description: e.target.value }))} />
              <div className="flex items-center gap-2">
                <button className="rounded bg-blue-600 px-3 py-1.5 text-white" onClick={() => save(p.id)}>
                  保存
                </button>
                <button className="rounded border px-3 py-1.5" onClick={cancelEdit}>
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Link href={`/projects/${p.id}`} className="font-medium hover:underline">
                  {p.title}
                </Link>
                <span className="text-xs rounded bg-slate-100 px-2 py-0.5">{p.status}</span>
              </div>
              {p.description && <p className="text-sm text-slate-600">{p.description}</p>}
              <div className="flex items-center gap-2">
                <button className="rounded border px-3 py-1.5 text-sm" onClick={() => startEdit(p)}>
                  編集
                </button>
                <button className="rounded border px-3 py-1.5 text-sm" onClick={() => remove(p.id)}>
                  削除
                </button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
