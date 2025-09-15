# AI BPR App

AI活用BPR成長支援アプリ（学習・実践・可視化・コミュニティ）。docs/requirements.md と docs/design.md に基づくプロトタイプ実装です。

## セットアップ

1. 依存関係のインストール

```bash
pnpm install # または npm install / yarn
```

2. 環境変数を設定

```bash
cp .env.example .env
# DATABASE_URL, NEXTAUTH_SECRET を設定
# OpenAIを使う場合は OPENAI_API_KEY と（任意で）OPENAI_MODEL=gpt-4o-mini などを設定
```

3. Prisma 生成と初期化（開発は SQLite）

```bash
pnpm prisma generate
pnpm prisma migrate dev --name init
pnpm prisma db seed  # うまくいかない場合は `npx prisma migrate deploy` でも可
```

4. 開発サーバー起動

```bash
pnpm dev
```

## 主なディレクトリ

- `src/app` Next.js App Router ルート/API
- `src/components` UI コンポーネント
- `src/lib` DB/認証/バリデーション等のユーティリティ
- `prisma/schema.prisma` データベーススキーマ

## 実装済み（tasks.md 対応）

- 1: プロジェクト構造/設定（TypeScript, ESLint, Prettier, Tailwind）
- 2.1: Prisma スキーマ（users, user_skills, learning_contents, user_progress, bpr_projects, process_analyses）
- 2.2: TypeScript 型の定義（一部）
- 3.1: NextAuth（Credentials）基本設定（ページは簡易）
- 4: ユーザー/学習 API の最低限ルート
- 5: 学習UIの基本コンポーネント（カード/進捗/難易度）
- 7.2: プロセス分析APIの骨組み（AIはスタブ）
- 8: ダッシュボードの簡易ページ

未実装/今後:
- 認証UIとセッション連携、保護ルート
- 学習進捗の実データ連携と次ステップ推奨
- プロジェクトCRUD/一覧・詳細API
- コミュニティ（事例/Q&A）
- バリデーション/エラーハンドリングの拡充、テスト

## 注意

- 開発DBは SQLite を使用します（`.env` の `DATABASE_URL=file:./dev.db`）。本番は PostgreSQL 想定です。
- AI 分析は `src/lib/ai.ts` でスタブ実装。OpenAI 連携は未接続。
- 認証は Credentials を想定。パスワードは `User.passwordHash` にハッシュ保存が必要です。

## 既定のデモユーザー（シード）

- メール: `demo@example.com`
- パスワード: `demo1234`
