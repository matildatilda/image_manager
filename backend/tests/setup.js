// テスト用の環境変数を設定
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.PORT = '8080';
process.env.CORS_ORIGIN = 'http://localhost:3000';

// テスト実行前のグローバル設定
beforeAll(() => {
  // コンソールエラーを抑制（必要に応じて）
  // jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  // クリーンアップ処理
});