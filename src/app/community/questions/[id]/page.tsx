"use client";
import { useCallback, useEffect, useState } from 'react';

export default function QuestionDetailPage({ params }: { params: { id: string } }) {
  const [q, setQ] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [body, setBody] = useState('');
  const [experts, setExperts] = useState<any[]>([]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/community/questions/${params.id}`);
    const json = await res.json();
    setQ(json.data?.question);
    setAnswers(json.data?.answers || []);
    const m = await fetch(`/api/community/questions/${params.id}/match`);
    const mj = await m.json();
    setExperts(mj.data || []);
  }, [params.id]);
  useEffect(()=>{ load(); },[load]);

  if (!q) return <div className="p-6">読み込み中...</div>;
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-xl font-semibold">{q.title}</h1>
      <div className="text-sm text-slate-600">{new Date(q.created_at).toLocaleString('ja-JP')}</div>
      {q.tags_text && <div className="text-xs text-slate-500">タグ: {q.tags_text}</div>}
      <article className="whitespace-pre-wrap text-slate-800">{q.body}</article>

      <section className="space-y-2">
        <h2 className="font-semibold">回答</h2>
        <ul className="space-y-2">
          {answers.map((a)=> (
            <li key={a.id} className="rounded border p-3">
              <div className="text-sm text-slate-700 whitespace-pre-wrap">{a.body}</div>
              <div className="text-xs text-slate-500 mt-1">{new Date(a.created_at).toLocaleString('ja-JP')}</div>
            </li>
          ))}
        </ul>
      </section>

      {experts.length > 0 && (
        <section className="space-y-2">
          <h3 className="font-semibold">おすすめ回答者</h3>
          <ul className="space-y-1 text-sm text-slate-800">
            {experts.map((e)=> (
              <li key={e.id} className="flex items-center justify-between">
                <span>{e.name}（{(e.areas||[]).join(', ')}）</span>
                <span className="text-xs text-slate-500">score: {e.score}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-2">
        <h3 className="font-semibold">回答する</h3>
        <textarea className="w-full rounded border p-2" placeholder="本文" value={body} onChange={(e)=>setBody(e.target.value)} />
        <button className="rounded bg-blue-600 px-3 py-2 text-white" onClick={async()=>{ await fetch(`/api/community/questions/${params.id}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ body }) }); setBody(''); await load(); }}>投稿</button>
      </section>
    </main>
  );
}
