const AWS = require('aws-sdk');

// LocalStack用の設定（本番環境では不要）
const s3Config = {
  region: process.env.AWS_REGION || 'ap-northeast-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

// ローカル環境ではLocalStackを使用
if (process.env.NODE_ENV === 'development') {
  s3Config.endpoint = new AWS.Endpoint('http://localstack:4566');
  s3Config.s3ForcePathStyle = true;
  s3Config.sslEnabled = false;
}

const s3 = new AWS.S3(s3Config);
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// バケット初期化（LocalStack用）
const initBucket = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      await s3.createBucket({ Bucket: BUCKET_NAME }).promise();
      console.log(`Bucket ${BUCKET_NAME} created`);
    } catch (error) {
      if (error.code !== 'BucketAlreadyOwnedByYou') {
        console.error('Bucket creation error:', error);
      }
    }
  }
};

// 初期化実行
initBucket();

const s3Service = {
  // 画像アップロード
  async uploadImage(userId, buffer, filename, contentType, isThumbnail = false) {
    const key = `${userId}/${isThumbnail ? 'thumbnails/' : ''}${Date.now()}-${filename}`;
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: {
        userId,
        uploadedAt: new Date().toISOString()
      }
    };

    await s3.putObject(params).promise();
    return key;
  },

  // 署名付きURL生成
  async getSignedUrl(key, expiresIn = 3600) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: expiresIn
    };

    return s3.getSignedUrl('getObject', params);
  },

  // ユーザーの画像一覧取得
  async listUserImages(userId) {
    const params = {
      Bucket: BUCKET_NAME,
      Prefix: `${userId}/`,
      MaxKeys: 100
    };

    const data = await s3.listObjectsV2(params).promise();
    
    const images = await Promise.all(
      data.Contents
        .filter(item => !item.Key.includes('thumbnails/'))
        .map(async (item) => {
          const url = await this.getSignedUrl(item.Key);
          return {
            id: item.Key,
            url,
            size: item.Size,
            lastModified: item.LastModified
          };
        })
    );

    return images;
  },

  // 画像削除
  async deleteImage(key) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(params).promise();
  }
};

module.exports = s3Service;