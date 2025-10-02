# 画像管理アプリ - バックエンドセットアップ

## 前提条件
- Docker Desktop インストール済み
- Docker Compose インストール済み
- Node.js 18以上（ローカル開発用）

## セットアップ手順

### 1. リポジトリ構成の作成

```bash
# プロジェクトルートで実行
mkdir -p backend/src/routes
mkdir -p backend/src/middleware
mkdir -p backend/src/services
mkdir -p localstack-data
```

### 2. 環境変数の設定

```bash
# .envファイルを作成
cp .env.example .env

# 必要に応じて値を編集（ローカル開発ではデフォルト値でOK）
```

### 3. Docker環境の起動

```bash
# すべてのサービスを起動
docker-compose up -d

# ログ確認
docker-compose logs -f backend

# ヘルスチェック
curl http://localhost:8080/health
```

### 4. 動作確認

#### ヘルスチェック
```bash
curl http://localhost:8080/health
```

**期待される応答:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-02T...",
  "environment": "development"
}
```

#### ユーザー登録
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**期待される応答:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

#### ログイン
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### 画像アップロード
```bash
# トークンを環境変数に設定
export TOKEN="取得したJWTトークン"

# 画像アップロード
curl -X POST http://localhost:8080/api/images/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/path/to/your/image.jpg"
```

#### 画像一覧取得
```bash
curl http://localhost:8080/api/images \
  -H "Authorization: Bearer $TOKEN"
```

## ディレクトリ構成

```
backend/
├── Dockerfile
├── package.json
├── src/
│   ├── app.js              # メインアプリケーション
│   ├── routes/
│   │   ├── auth.js         # 認証エンドポイント
│   │   └── images.js       # 画像管理エンドポイント
│   ├── middleware/
│   │   └── auth.js         # JWT認証ミドルウェア
│   └── services/
│       ├── s3.js           # S3操作
│       └── imageProcessor.js # 画像処理
```

## 主な機能

### 認証機能
- ユーザー登録 (`POST /api/auth/register`)
- ログイン (`POST /api/auth/login`)
- トークン検証 (`GET /api/auth/me`)

### 画像管理機能
- 画像アップロード (`POST /api/images/upload`)
  - 自動サムネイル生成
  - S3/LocalStackへの保存
- 画像一覧取得 (`GET /api/images`)
- 画像削除 (`DELETE /api/images/:imageId`)

## トラブルシューティング

### ポートが使用中の場合
```bash
# 8080ポートを使用しているプロセスを確認
lsof -i :8080

# 別のポートを使用する場合は.envを編集
PORT=8081
```

### LocalStackが起動しない
```bash
# LocalStackコンテナのログ確認
docker-compose logs localstack

# LocalStackを再起動
docker-compose restart localstack
```

### 画像アップロードが失敗する
```bash
# バックエンドのログ確認
docker-compose logs -f backend

# LocalStackのバケット確認
aws --endpoint-url=http://localhost:4566 s3 ls
```

## 停止・クリーンアップ

```bash
# サービス停止
docker-compose down

# データも含めて完全削除
docker-compose down -v
rm -rf localstack-data
```

## 次のステップ

1. **フロントエンド連携**: Next.jsアプリから`http://localhost:8080`にアクセス
2. **本番デプロイ準備**: GCPアカウント作成、Cloud Run設定
3. **AWS S3設定**: 実際のS3バケット作成、認証情報設定

## 環境別の設定

### ローカル開発
- LocalStack（S3モック）を使用
- JWT_SECRETはダミー値でOK

### 本番環境
- AWS S3を使用
- JWT_SECRETを強力な値に変更
- 環境変数をCloud Run Secretsで管理