const crypto = require('crypto');

async function uploadEncryptedFile(base64Data, folder = 'aina') {
  // In production, replace with Cloudinary or S3 implementation.
  // This simulation preserves the encrypted data handling contract.
  if (!base64Data) {
    return null;
  }

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const uploadRes = await cloudinary.uploader.upload(`data:application/octet-stream;base64,${base64Data}`, {
      folder,
      resource_type: 'raw',
      use_filename: false,
      unique_filename: true,
      overwrite: false
    });

    return uploadRes.secure_url;
  }

  const digest = crypto.createHash('sha256').update(base64Data).digest('hex');
  return `https://storage.local/encrypted/${folder}/${digest}`;
}

module.exports = { uploadEncryptedFile };
