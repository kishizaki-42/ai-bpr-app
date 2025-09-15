import './globals.css';
import React from 'react';
import { Providers } from '@/components/Providers';

export const metadata = {
  title: 'AI BPR App',
  description: 'AI活用BPR成長支援アプリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-white text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
