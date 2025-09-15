"use client";
import { useCallback, useEffect, useState } from 'react';

export default function CommunityPage() {
  const [tab, setTab] = useState<'cases'|'questions'>('cases');
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">コミュニティ</h1>
      <div className="flex gap-2">
        <button className={`rounded border px-3 py-1.5 ${tab==='cases'?'bg-slate-900 text-white':''}`} onClick={()=>setTab('cases')}>事例</button>
        <button className={`rounded border px-3 py-1.5 ${tab==='questions'?'bg-slate-900 text-white':''}`} onClick={()=>setTab('questions')}>Q&A</button>
      </div>
      {tab==='cases'? <Cases/> : <Questions/>}
    </main>
  );
}

function Cases() {
  const [list, setList] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const load = useCallback(async () => {
    const res = await fetch('/api/community/cases?q='+encodeURIComponent(q));
    const json = await res.json();
    setList(json.data||[]);
  }, [q]);
  useEffect(()=>{ load(); },[load]);
  return (
    <section className="space-y-4">
      <div className="flex gap-2">
        <input className="rounded border p-2" placeholder="検索" value={q} onChange={(e)=>setQ(e.target.value)} />
        <button className="rounded border px-3" onClick={load}>検索</button>
      </div>
      <div className="rounded border p-4 space-y-3">
        <div className="font-semibold">事例投稿</div>
        <input className="w-full rounded border p-2" placeholder="タイトル" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <textarea className="w-full rounded border p-2" placeholder="内容" value={content} onChange={(e)=>setContent(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="タグ（カンマ区切り）" value={tags} onChange={(e)=>setTags(e.target.value)} />
        <button className="rounded bg-blue-600 px-3 py-2 text-white" onClick={async()=>{ await fetch('/api/community/cases',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ title, content, tags })}); setTitle(''); setContent(''); setTags(''); await load();}}>投稿</button>
      </div>
      <ul className="space-y-3">
        {list.map((r)=> (
          <li key={r.id} className="rounded border p-3">
            <div className="flex items-center justify-between">
              <a className="font-medium hover:underline" href={`/community/cases/${r.id}`}>{r.title}</a>
              <div className="text-xs text-slate-600">{new Date(r.created_at).toLocaleString('ja-JP')}</div>
            </div>
            <div className="text-sm text-slate-700 whitespace-pre-wrap">{r.content}</div>
            {r.tags_text && (
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-1">
                {String(r.tags_text).split(/[,、\s]+/).filter(Boolean).map((t:string)=> (
                  <button key={t} className="rounded bg-slate-100 px-2 py-0.5" onClick={()=>{ setQ(t); }}>
                    #{t}
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Questions() {
  const [list, setList] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const load = useCallback(async () => {
    const res = await fetch('/api/community/questions?q='+encodeURIComponent(q));
    const json = await res.json();
    setList(json.data||[]);
  }, [q]);
  useEffect(()=>{ load(); },[load]);
  return (
    <section className="space-y-4">
      <div className="flex gap-2">
        <input className="rounded border p-2" placeholder="検索" value={q} onChange={(e)=>setQ(e.target.value)} />
        <button className="rounded border px-3" onClick={load}>検索</button>
      </div>
      <div className="rounded border p-4 space-y-3">
        <div className="font-semibold">質問投稿</div>
        <input className="w-full rounded border p-2" placeholder="タイトル" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <textarea className="w-full rounded border p-2" placeholder="本文" value={body} onChange={(e)=>setBody(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="タグ（カンマ区切り）" value={tags} onChange={(e)=>setTags(e.target.value)} />
        <button className="rounded bg-blue-600 px-3 py-2 text-white" onClick={async()=>{ await fetch('/api/community/questions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ title, body, tags })}); setTitle(''); setBody(''); setTags(''); await load();}}>投稿</button>
      </div>
      <ul className="space-y-3">
        {list.map((r)=> (
          <li key={r.id} className="rounded border p-3">
            <div className="flex items-center justify-between">
              <a className="font-medium hover:underline" href={`/community/questions/${r.id}`}>{r.title}</a>
              <div className="text-xs text-slate-600">{new Date(r.created_at).toLocaleString('ja-JP')}</div>
            </div>
            <div className="text-sm text-slate-700 whitespace-pre-wrap">{r.body}</div>
            {r.tags_text && (
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-1">
                {String(r.tags_text).split(/[,、\s]+/).filter(Boolean).map((t:string)=> (
                  <button key={t} className="rounded bg-slate-100 px-2 py-0.5" onClick={()=>{ setQ(t); }}>
                    #{t}
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
