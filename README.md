# 潮目 SHIOME BOT対戦

換金不可の娯楽用ポイントで遊ぶ、完全静的なWebゲームです。

## 最短公開方法
1. このZIPを展開する。
2. GitHubで新規リポジトリ `shiome-bot-game` を作る。
3. 5ファイルをアップロードする。
4. Settings → Pages → Deploy from a branch → `main` / `root` → Save。
5. 数分後に表示される公開URLへアクセスする。

## 構成
- `index.html` 画面
- `styles.css` デザイン
- `app.js` ゲーム、BOT、配当計算
- `manifest.webmanifest` ホーム画面追加
- `sw.js` オフラインキャッシュ

バックエンド、データベース、APIキーは不要です。