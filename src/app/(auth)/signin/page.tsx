"use client";
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="mx-auto max-w-sm p-6 space-y-4">
      <h1 className="text-2xl font-bold">サインイン</h1>
      {error && <div className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</div>}
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await signIn('credentials', { email, password, redirect: false });
          if (res?.error) setError('メールアドレスまたはパスワードが違います');
          else window.location.href = '/dashboard';
        }}
      >
        <div>
          <label className="block text-sm font-medium">メールアドレス</label>
          <input className="mt-1 w-full rounded border p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">パスワード</label>
          <input className="mt-1 w-full rounded border p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="rounded bg-blue-600 px-3 py-2 text-white">サインイン</button>
      </form>
    </main>
  );
}

