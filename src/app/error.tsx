"use client";
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="mx-auto max-w-lg p-6 space-y-3">
          <h2 className="text-xl font-semibold">エラーが発生しました</h2>
          <p className="text-sm text-slate-600">問題が継続する場合は時間をおいて再度お試しください。</p>
          <button className="rounded bg-blue-600 px-3 py-2 text-white" onClick={() => reset()}>
            再試行
          </button>
        </div>
      </body>
    </html>
  );
}

