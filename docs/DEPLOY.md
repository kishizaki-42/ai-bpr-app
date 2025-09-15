# デプロイと環境切り替え

本アプリは開発では SQLite、 本番では PostgreSQL を利用できるよう構成しています。

## 環境変数

- 開発: `.env` に `DATABASE_URL=file:./dev.db`（既定）
- 本番: `.env.production` を用意し、`DATABASE_URL` に PostgreSQL の接続文字列を設定
  - 例: `postgresql://USER:PASSWORD@HOST:5432/DB?schema=public&sslmode=require`
- 認証: `NEXTAUTH_SECRET` を十分に長いランダム値に設定
- OpenAI: `OPENAI_API_KEY`（任意）、`OPENAI_MODEL`（任意）

## Prisma スキーマ

- 開発（SQLite）: `prisma/schema.prisma`
- 本番（PostgreSQL）: `prisma/postgres/schema.prisma`
  - フィールド名は同じですが、PostgreSQL では JSON/配列型を利用します（例: `*_text` 列は JSON/配列）。

## コマンド

- 開発（SQLite）
  - 生成: `npm run prisma:generate`
  - マイグレーション: `npm run prisma:migrate`
- 本番（PostgreSQL）
  - 生成: `npm run prisma:generate:pg`
  - スキーマ反映（初回や簡便な同期）: `npm run prisma:push:pg`
  - 既存のマイグレーション適用: `npm run prisma:migrate:pg`

注: SQLite 用に作成された `prisma/migrations` は PostgreSQL とは互換がありません。初回デプロイでは `db push` でスキーマを作成し、その後 PostgreSQL 環境でマイグレーションを運用することを推奨します。

## Vercel でのデプロイ

1. リポジトリを Vercel にインポート
2. プロジェクト設定 → Environment Variables に以下を設定
   - `DATABASE_URL`（Vercel Postgres などの接続文字列）
   - `NEXTAUTH_SECRET`
   - `OPENAI_API_KEY`（任意）
3. ビルドコマンド（例）
   - `npm run prisma:generate:pg && npm run build`
4. デプロイ後、データベースにスキーマ反映
   - Vercel のターミナル／自動化ジョブ等で `npm run prisma:push:pg` を実行
   - 以降は `npm run prisma:migrate:pg` を用いてマイグレーションを適用

## Render / Railway 等

- デプロイ前のビルドフェーズで `npm run prisma:generate:pg` を実行
- リリース後に `npm run prisma:push:pg` で初期スキーマを作成
- 以降は `npm run prisma:migrate:pg` をリリース時に実行

## よくある質問

- Q: 本番だけ JSON/配列にしたのはなぜ？
  - A: SQLite の制約に合わせて開発を簡易化するためです。アプリ側コードは列名に依存しており、型の違いは Prisma が吸収します。
- Q: 既に SQLite でデータがある場合に移行するには？
  - A: 移行スクリプトを作成し、SQLite からエクスポートした JSON/CSV を PostgreSQL にインポートしてください（アプリの列名は共通です）。

