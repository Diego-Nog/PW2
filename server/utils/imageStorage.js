const { v2: cloudinary } = require('cloudinary');

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME
  && process.env.CLOUDINARY_API_KEY
  && process.env.CLOUDINARY_API_SECRET
);

const useCloudinaryUploads = hasCloudinaryConfig;

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const isAbsoluteUrl = (value) => typeof value === 'string' && /^https?:\/\//i.test(value);

const toPublicImagePath = (value) => {
  if (!value || value === 'default_avatar.png') return null;
  if (isAbsoluteUrl(value) || value.startsWith('/uploads/')) return value;
  return `/uploads/${value}`;
};

async function uploadImage(file, folder) {
  if (!file) return null;

  if (!useCloudinaryUploads) {
    return file.filename;
  }

  if (!file.buffer) {
    throw new Error('El archivo recibido no contiene datos');
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result.secure_url);
      }
    );

    stream.end(file.buffer);
  });
}

module.exports = {
  useCloudinaryUploads,
  toPublicImagePath,
  uploadImage,
};