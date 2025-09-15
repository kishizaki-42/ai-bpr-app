"use client";
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ClientCaseEditor({ id, title, content, tags }: { id: string; title: string; content: string; tags: string }) {
  const [t, setT] = useState(title);
  const [c, setC] = useState(content);
  const [g, setG] = useState(tags);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/community/cases/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: t, content: c, tags: g }) });
      if (!res.ok) throw new Error('保存に失敗しました');
      toast.success('保存しました');
    } catch (e: any) {
      toast.error(e?.message || '保存に失敗しました');
    } finally { setBusy(false); }
  }

  return (
    <div className="rounded border p-3 space-y-2">
      <div className="text-sm font-semibold">編集</div>
      <input className="w-full rounded border p-2" value={t} onChange={(e)=>setT(e.target.value)} />
      <textarea className="w-full rounded border p-2" value={c} onChange={(e)=>setC(e.target.value)} />
      <input className="w-full rounded border p-2" value={g} onChange={(e)=>setG(e.target.value)} />
      <button className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-60" onClick={save} disabled={busy}>保存</button>
    </div>
  );
}

