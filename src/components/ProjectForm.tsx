"use client";
import { useState } from 'react';

type Props = {
  onSubmit: (data: { title: string; description?: string; currentProcess?: any }) => void | Promise<void>;
};

export function ProjectForm({ onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({ title, description });
        setTitle('');
        setDescription('');
      }}
    >
      <div>
        <label className="block text-sm font-medium">タイトル</label>
        <input className="mt-1 w-full rounded border p-2" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium">説明</label>
        <textarea className="mt-1 w-full rounded border p-2" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <button type="submit" className="rounded bg-blue-600 px-3 py-2 text-white">作成</button>
    </form>
  );
}

