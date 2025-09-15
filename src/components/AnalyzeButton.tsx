"use client";
import { useState } from 'react';

export function AnalyzeButton({ projectId, processJson }: { projectId: string; processJson: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {error && <div className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</div>}
      <button
        className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-60"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setError(null);
          try {
            const res = await fetch('/api/process/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ projectId, process: JSON.parse(processJson || '{}') }),
            });
            if (!res.ok) throw new Error('分析APIの呼び出しに失敗しました');
            location.reload();
          } catch (e: any) {
            setError(e?.message || '失敗しました');
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? '分析中...' : 'AI分析を実行'}
      </button>
    </div>
  );
}

