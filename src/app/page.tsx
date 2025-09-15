import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">AI活用BPR成長支援アプリ</h1>
      <p className="text-slate-600">学習・実践・可視化をひとつに。</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card title="ダッシュボード" href="/dashboard" desc="学習とプロジェクトの進捗を確認" />
        <Card title="学習" href="/learning" desc="学習コンテンツを始める" />
        <Card title="プロジェクト" href="/projects" desc="BPRプロジェクトを管理" />
        <Card title="コミュニティ" href="/community" desc="事例やQ&Aを閲覧" />
      </div>
    </main>
  );
}

function Card({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="block rounded-lg border p-4 hover:shadow">
      <div className="flex items-center gap-3">
        <Image src="/icons/learning.svg" alt="" width={28} height={28} loading="lazy" />
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-sm text-slate-600">{desc}</p>
        </div>
      </div>
    </Link>
  );
}
