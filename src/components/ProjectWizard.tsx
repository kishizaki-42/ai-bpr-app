"use client";
import { useState } from 'react';
import toast from 'react-hot-toast';

type Step = 1 | 2 | 3;

export function ProjectWizard({ onCreated }: { onCreated?: () => void | Promise<void> }) {
  const [step, setStep] = useState<Step>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currentProcess, setCurrentProcess] = useState('{\n  "actors": [],\n  "steps": []\n}');
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    try {
      let parsed: any = {};
      try { parsed = JSON.parse(currentProcess || '{}'); } catch (e) { toast.error('現状プロセスはJSONとして無効です'); setBusy(false); return; }
      const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, currentProcess: parsed }) });
      if (!res.ok) throw new Error('作成に失敗しました');
      toast.success('プロジェクトを作成しました');
      await onCreated?.();
      setStep(1); setTitle(''); setDescription(''); setCurrentProcess('{\n  "actors": [],\n  "steps": []\n}');
    } catch (e: any) {
      toast.error(e?.message || '作成に失敗しました');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 text-sm">
        <Badge n={1} active={step === 1}>基本情報</Badge>
        <Badge n={2} active={step === 2}>現状プロセス</Badge>
        <Badge n={3} active={step === 3}>確認</Badge>
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">タイトル</label>
            <input className="mt-1 w-full rounded border p-2" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">説明</label>
            <textarea className="mt-1 w-full rounded border p-2" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button className="rounded bg-blue-600 px-3 py-2 text-white" onClick={() => setStep(2)} disabled={!title}>次へ</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">現状プロセス（JSON）</label>
            <textarea className="mt-1 w-full h-40 rounded border p-2 font-mono text-sm" value={currentProcess} onChange={(e) => setCurrentProcess(e.target.value)} />
            <p className="text-xs text-slate-600 mt-1">例: {`{"actors":["営業","総務"],"steps":[{"name":"受付","avgTime":2}]}`}</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded border px-3 py-2" onClick={() => setStep(1)}>戻る</button>
            <button className="rounded bg-blue-600 px-3 py-2 text-white" onClick={() => setStep(3)}>確認</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <div className="rounded bg-slate-50 p-3 text-sm">
            <div><span className="font-medium">タイトル:</span> {title}</div>
            {description && <div><span className="font-medium">説明:</span> {description}</div>}
            <div className="mt-2">
              <div className="font-medium">現状プロセス</div>
              <pre className="overflow-x-auto">{currentProcess}</pre>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="rounded border px-3 py-2" onClick={() => setStep(2)}>戻る</button>
            <button className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-60" onClick={create} disabled={busy}>作成</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ n, active, children }: { n: number; active: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-2 ${active ? 'text-blue-700' : 'text-slate-500'}`}>
      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${active ? 'bg-blue-100' : 'bg-slate-100'}`}>{n}</span>
      <span>{children}</span>
    </div>
  );
}
