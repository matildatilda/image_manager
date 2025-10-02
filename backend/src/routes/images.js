const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const s3Service = require('../services/s3');
const imageProcessor = require('../services/imageProcessor');

const router = express.Router();

// メモリストレージ設定
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB制限
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// 画像一覧取得
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const images = await s3Service.listUserImages(userId);
    res.json({ images });
  } catch (error) {
    console.error('List images error:', error);
    res.status(500).json({ error: 'Failed to list images' });
  }
});

// 画像アップロード
router.post('/upload', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const userId = req.user.id;
    const originalBuffer = req.file.buffer;
    
    // サムネイル生成
    const thumbnailBuffer = await imageProcessor.createThumbnail(originalBuffer);
    
    // S3にアップロード
    const originalKey = await s3Service.uploadImage(
      userId,
      originalBuffer,
      req.file.originalname,
      req.file.mimetype
    );

    const thumbnailKey = await s3Service.uploadImage(
      userId,
      thumbnailBuffer,
      `thumb_${req.file.originalname}`,
      'image/jpeg',
      true
    );

    // 署名付きURL生成
    const originalUrl = await s3Service.getSignedUrl(originalKey);
    const thumbnailUrl = await s3Service.getSignedUrl(thumbnailKey);

    res.status(201).json({
      image: {
        id: originalKey,
        originalUrl,
        thumbnailUrl,
        filename: req.file.originalname,
        size: req.file.size,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// 画像削除
router.delete('/:imageId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const imageId = req.params.imageId;

    await s3Service.deleteImage(imageId);
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;