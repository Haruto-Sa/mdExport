# 論文要約ツール

日本語の学術論文を要約し、Markdown形式で出力するWebアプリケーションです。Google Gemini AIを使用して高品質な要約を生成します。

## 機能

- **ファイルのアップロード**: `.txt`形式および`.pdf`形式の学術論文ファイルを処理
- **AI要約**: Google Gemini AIを使用した構造化された日本語要約の生成
- **Markdownエクスポート**: 要約内容を適切なファイル名で`.md`ファイルとしてダウンロード
- **エラーハンドリング**: API問題、ファイルエラー、バリデーションの包括的なエラー処理

## セットアップ

### 前提条件

- Node.js (v18以上推奨)
- npm

### インストール

1. リポジトリをクローンまたはダウンロード
2. 依存関係をインストール:
   ```bash
   npm install
   ```

### 環境設定

1. プロジェクトルートに`.env.local`ファイルを作成
2. Google Gemini APIキーを設定:
   ```text
   GEMINI_API_KEY=your_api_key_here
   ```

### APIキーの取得

1. [Google AI Studio](https://aistudio.google.com/)にアクセス
2. APIキーを生成
3. `.env.local`ファイルに追加

## 使用方法

### 開発環境で実行

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開き、アプリケーションを使用できます。

### 本番環境用ビルド

```bash
npm run build
```

### 本番ビルドのプレビュー

```bash
npm run preview
```

### アプリケーションの使用手順

1. Webアプリケーションを開く
2. 「論文ファイル(.txt, .pdf)」ボタンをクリックして、テキストファイルまたはPDFファイルを選択
3. 「論文を要約」ボタンをクリック
4. AI要約が完了するまで待機
5. 要約結果を確認
6. 「MDとしてダウンロード」ボタンをクリックしてMarkdownファイルを保存

## 技術仕様

### 使用技術

- **フロントエンド**: TypeScript, Vanilla JavaScript
- **ビルドツール**: Vite
- **AI**: Google Gemini AI (`gemini-2.5-flash-preview-04-17`モデル)
- **パッケージマネージャー**: npm

### プロジェクト構成

```text
mdExport/
├── index.html          # メインHTMLファイル
├── index.tsx           # アプリケーションロジック
├── index.css           # スタイルシート
├── package.json        # 依存関係とスクリプト
├── tsconfig.json       # TypeScript設定
├── vite.config.ts      # Vite設定
├── .env.local          # 環境変数（要作成）
└── CLAUDE.md           # 開発ガイド
```

### 対応ファイル形式

- **入力**: `.txt`ファイル（UTF-8エンコーディング）、`.pdf`ファイル
- **出力**: `.md`ファイル（Markdown形式）

## 開発

### コマンド一覧

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番用ビルド |
| `npm run preview` | 本番ビルドをプレビュー |
| `npm install` | 依存関係をインストール |

### 設定

- TypeScriptは厳密モードで設定
- パスエイリアス `@/*` はプロジェクトルートに解決
- ES modulesとimportmapsを使用した依存関係の解決

## 注意事項

- APIキーは`.env.local`ファイルに保存し、バージョン管理に含めないでください
- 大きなファイルの処理には時間がかかる場合があります
- インターネット接続が必要です（Gemini API使用のため）

## ライセンス

このプロジェクトはプライベートプロジェクトです。

## サポート

問題が発生した場合は、以下を確認してください：

1. APIキーが正しく設定されているか
2. インターネット接続が安定しているか
3. アップロードするファイルが`.txt`または`.pdf`形式で、有効なテキストを含んでいるか

## 更新履歴

- v0.0.0: 初期バージョン - 基本的な論文要約機能とMarkdownエクスポート機能

## ローカル MCP サーバーの起動

開発中は Next.js と同時に arxiv-mcp-server / markitdown-mcp を起動するため、以下を実行してください。

```bash
npm run dev:mcp
```

- arxiv-mcp-server: http://localhost:8000
- markitdown-mcp:   http://localhost:8010

上記エンドポイントは `NEXT_PUBLIC_ARXIV_MCP_URL` と `NEXT_PUBLIC_MARKDOWN_MCP_URL` 環境変数で変更できます。
