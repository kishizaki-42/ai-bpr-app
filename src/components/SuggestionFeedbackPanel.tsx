"use client";
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type Summary = { up: number; down: number; adopted: number };

export function SuggestionFeedbackPanel({ projectId, analysisId, suggestionId }: { projectId: string; analysisId: string; suggestionId: string }) {
  const [summary, setSummary] = useState<Summary>({ up: 0, down: 0, adopted: 0 });
  const [mine, setMine] = useState<{ rating?: 'up' | 'down'; adopted?: boolean }>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/analyses/${analysisId}/feedback`);
    if (!res.ok) return;
    const json = await res.json();
    const s = (json.data.summary || {})[suggestionId] || { up: 0, down: 0, adopted: 0 };
    setSummary(s);
    const mineRow = (json.data.mine || []).find((r: any) => r.suggestion_id === suggestionId) || {};
    setMine({ rating: mineRow.rating, adopted: mineRow.adopted });
  }, [projectId, analysisId, suggestionId]);

  useEffect(() => { load(); }, [load]);

  async function send(partial: { rating?: 'up' | 'down' | null; adopted?: boolean }) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/analyses/${analysisId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionId, ...partial }),
      });
      if (!res.ok) throw new Error('送信に失敗しました');
      await load();
    } catch (e: any) {
      toast.error(e?.message || '送信に失敗しました');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 flex items-center gap-3 text-sm">
      <button className={`rounded border px-2 py-1 ${mine.rating === 'up' ? 'bg-blue-600 text-white' : ''}`} onClick={() => send({ rating: mine.rating === 'up' ? null as any : 'up' })} disabled={busy}>
        いいね ({summary.up})
      </button>
      <button className={`rounded border px-2 py-1 ${mine.rating === 'down' ? 'bg-slate-800 text-white' : ''}`} onClick={() => send({ rating: mine.rating === 'down' ? null as any : 'down' })} disabled={busy}>
        よくない ({summary.down})
      </button>
      <button className={`rounded border px-2 py-1 ${mine.adopted ? 'bg-green-600 text-white' : ''}`} onClick={() => send({ adopted: !mine.adopted })} disabled={busy}>
        採用 ({summary.adopted})
      </button>
    </div>
  );
}
