const sharp = require('sharp');

// サムネイル生成
async function createThumbnail(buffer, width = 200, height = 200) {
  try {
    return await sharp(buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch (error) {
    console.error('Thumbnail creation error:', error);
    throw new Error('Failed to create thumbnail');
  }
}

// 画像リサイズ
async function resizeImage(buffer, width, height) {
  try {
    return await sharp(buffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer();
  } catch (error) {
    console.error('Resize error:', error);
    throw new Error('Failed to resize image');
  }
}

// 画像メタデータ取得
async function getMetadata(buffer) {
  try {
    return await sharp(buffer).metadata();
  } catch (error) {
    console.error('Metadata error:', error);
    throw new Error('Failed to get image metadata');
  }
}

module.exports = {
  createThumbnail,
  resizeImage,
  getMetadata
};