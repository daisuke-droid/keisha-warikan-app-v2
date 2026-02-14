# Keisha Warikan (傾斜割り勘アプリ)

飲み会や会食での割り勘を、役職や飲酒量に合わせて「いい感じ」に傾斜をつけて計算できるWebアプリケーションです。

![App Screenshot](./public/og-image.png)

## 特徴

- **カンタン傾斜計算**: 参加者の役職（上司、先輩、同僚、後輩）を選ぶだけで、自動的に支払い比率（係数）を設定します。
- **端数調整**: 合計金額と合うように、100円単位などで丸めた上で差分を自動調整します。
- **カスタマイズ設定**: 丸め単位（1円〜1000円）、丸め方法（切り上げ/四捨五入/切り捨て）、調整優先度を変更可能です。
- **インストール不要**: Webブラウザで動作し、データは端末内（LocalStorage）に保存されます。

## 技術スタック

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules (Vanilla CSS variables)
- **State**: React Hooks + LocalStorage

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
# http://localhost:3000 で起動します
```

## デプロイ（Vercel）

このリポジトリを Vercel にインポートするだけで、設定なしでデプロイ可能です。

## プロジェクト構成

```
src/
  app/          # ページコンポーネント (Next.js App Router)
  components/   # 再利用可能なUIコンポーネント
  lib/          # 計算ロジック、リポジトリなどのコアロジック
  types/        # 型定義
  styles/       # グローバルスタイル
public/         # 静的アセット
```
