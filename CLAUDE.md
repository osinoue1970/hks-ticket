# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

北海道建設業信用保証株式会社（HKCS）の福利厚生システム。社員が北海道日本ハムファイターズのシーズンシート（エスコンフィールドHOKKAIDO）を月次抽選で申し込む。管理者が募集期間を管理し、抽選を実行する。

## Commands

```bash
npm run dev          # 開発サーバー起動 (Next.js)
npm run build        # prisma generate → db push → seed → next build
npm run seed         # シードデータ投入 (npx tsx prisma/seed.ts)
npx prisma studio    # DBブラウザ起動
npx prisma db push   # スキーマをDBに反映
```

テストフレームワークは未導入。

## Tech Stack

- **Next.js 16** (App Router, standalone output) + React 19 + TypeScript
- **Prisma** (SQLite, `prisma/dev.db`) — ORM & マイグレーション
- **Tailwind CSS v4** (`@import "tailwindcss"` 方式, PostCSS経由)
- **bcryptjs** — パスワードハッシュ
- **Render** にデプロイ (`render.yaml`)

## Architecture

### 認証
Cookie ベースのセッション管理（`src/lib/auth.ts`）。ログイン時に `{ id }` を JSON で cookie に保存。`getSession()` / `requireAuth()` / `requireAdmin()` でサーバーサイド認証。認証ライブラリ不使用。

### ルーティング・ロール分岐
- `/` — ログインページ (client component)
- `/dashboard/*` — 一般職員向け（申込み・結果確認・カレンダー）
- `/admin/*` — 管理者向け（職員管理・募集期間管理・抽選実行）
- サーバーコンポーネントで `getSession()` → ロール別にリダイレクト

### API Routes (`src/app/api/`)
- `auth/login`, `auth/logout` — 認証
- `employees/`, `employees/[id]` — 職員CRUD（管理者用）
- `applications/` — 希望申込み（第1〜第3希望）
- `lottery/` — 抽選実行（管理者用）

### 抽選ロジック (`src/app/api/lottery/route.ts`)
第1希望→第2→第3の順に処理。各試合で未当選者を優先、当選歴ありなら当選回数が少ない人を優先してランダム抽選。1回の月間抽選で1人最大1試合当選。

### データモデル (Prisma)
- `Employee` — 職員（`isAdmin` フラグでロール管理）
- `Game` — 試合（月・対戦相手・日時）
- `ApplicationPeriod` — 月次募集期間（`isOpen` / `isDrawn` で状態管理）
- `Application` — 申込み（第1〜第3希望、職員×期間でユニーク）
- `LotteryResult` — 当選結果（試合×1、当選者×1）

### コンポーネント構成
- サーバーコンポーネント中心（ページレベル）、フォーム系のみ `"use client"`
- `Header` — 共通ヘッダー（ロール別表示）
- `GameCalendar` — 月次カレンダービュー

### シードデータ (`prisma/seed.ts`)
管理者 `ADMIN/admin123`、テストユーザー `TEST01/hks`、ダミー職員 `E001〜E070/password`、2026シーズン全ホームゲーム、月次募集期間（4〜9月）を投入。

## Style

- UI: ブランドカラー `#003050` `#006098` `#4bbfd4`、白背景 + rounded-xl カード
- 日本語のみ（UIテキスト・エラーメッセージ・コメント全て日本語）
- `@/` パスエイリアス = `src/`
