"use client";
import { useState } from 'react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <main className="mx-auto max-w-sm p-6 space-y-4">
      <h1 className="text-2xl font-bold">サインアップ</h1>
      {msg && <div className="rounded bg-green-50 p-2 text-sm text-green-700">{msg}</div>}
      {err && <div className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</div>}
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr(null);
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, password }),
          });
          if (!res.ok) {
            setErr('登録に失敗しました');
            return;
          }
          setMsg('登録が完了しました。サインインしてください');
        }}
      >
        <div>
          <label className="block text-sm font-medium">名前</label>
          <input className="mt-1 w-full rounded border p-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">メールアドレス</label>
          <input className="mt-1 w-full rounded border p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">パスワード</label>
          <input className="mt-1 w-full rounded border p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="rounded bg-blue-600 px-3 py-2 text-white">登録</button>
      </form>
    </main>
  );
}

