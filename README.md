# Instagram画像リサイザー

Instagramの4:5比率（1080×1350px）に画像をリサイズし、カスタム余白を追加するプログレッシブウェブアプリ（PWA）です。すべての画像処理はクライアントサイドで行われるため、画像がデバイスから外部に送信されることはありません。

## 機能

- 複数画像のアップロード（JPG、PNG、HEIC）- 一度に最大30枚
- Instagramの4:5比率（1080×1350px）へのリサイズ
- アスペクト比を維持するためのカスタム余白
- 最適なファイルサイズのためのJPEG画質調整
- 高解像度出力オプション（2160×2700px）
- 個別またはZIPファイルでの一括ダウンロード
- プログレッシブウェブアプリ（PWA）としてオフラインでも動作
- モバイルフレンドリーなレスポンシブデザイン

## 技術スタック

- Next.js 14（App Router）
- TypeScript
- Tailwind CSS & shadcn/uiのUIコンポーネント
- Canvas APIによるクライアントサイド画像処理
- browser-image-compressionによる大きな画像の最適化
- JSZipによる一括ダウンロード
- サービスワーカーによるPWAサポート
- Jestによる単体テスト

## ローカル開発

### 前提条件

- Node.js 18.17以降
- npmまたはyarn

### インストール

1. リポジトリをクローン：

\`\`\`bash
git clone https://github.com/yourusername/instagram-image-resizer.git
cd instagram-image-resizer
\`\`\`

2. 依存関係のインストール：

\`\`\`bash
npm install
# または
yarn install
\`\`\`

3. 開発サーバーの起動：

\`\`\`bash
npm run dev
# または
yarn dev
\`\`\`

4. ブラウザで[http://localhost:3000](http://localhost:3000)を開きます。

## Vercelへのデプロイ

このアプリをデプロイする最も簡単な方法はVercelを使用することです：

1. このリポジトリをGitHubアカウントにフォーク
2. [Vercel](https://vercel.com)で新しいプロジェクトを作成
3. GitHubリポジトリをインポート
4. デプロイ！

または、コマンドラインから直接デプロイすることもできます：

\`\`\`bash
npm i -g vercel
vercel
\`\`\`

## 仕組み

1. **画像アップロード**：ファイル入力またはドラッグ＆ドロップで画像を選択
2. **処理**：
   - メモリ使用量を減らすために画像を圧縮
   - Canvas APIを使用してアスペクト比を維持しながら画像をリサイズ
   - 4:5比率を実現するために余白を追加
3. **ダウンロード**：処理された画像を個別またはZIPファイルとしてダウンロード

## ライセンス

MIT
