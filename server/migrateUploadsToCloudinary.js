const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Game = require('./models/Game');
const User = require('./models/User');
const { uploadImage, useCloudinaryUploads } = require('./utils/imageStorage');

const uploadsDir = path.join(__dirname, 'uploads');
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error('MONGO_URI no está configurado');
}

if (!useCloudinaryUploads) {
  throw new Error('Faltan variables CLOUDINARY_* para ejecutar la migración');
}

function extractUploadFileName(value) {
  if (!value || typeof value !== 'string') return null;
  if (value === 'default_avatar.png') return null;
  if (value.startsWith('http://') || value.startsWith('https://')) return null;
  if (value.startsWith('/uploads/')) return value.slice('/uploads/'.length);
  if (/^[^/\\]+\.(png|jpe?g|webp|gif)$/i.test(value)) return value;
  return null;
}

async function uploadLocalFile(fileName, folder) {
  const localPath = path.join(uploadsDir, fileName);

  if (!fs.existsSync(localPath)) {
    throw new Error(`Archivo no encontrado: ${localPath}`);
  }

  const buffer = await fs.promises.readFile(localPath);
  return uploadImage({ buffer, originalname: fileName }, folder);
}

async function migrateUsers() {
  const users = await User.find({
    profile_pic: { $exists: true, $nin: [null, '', 'default_avatar.png'] },
  });

  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    const fileName = extractUploadFileName(user.profile_pic);

    if (!fileName) {
      skipped += 1;
      continue;
    }

    const uploadedUrl = await uploadLocalFile(fileName, 'gamesense/profile-pics');
    user.profile_pic = uploadedUrl;
    await user.save();
    migrated += 1;
    console.log(`Usuario migrado: ${user.username} -> ${uploadedUrl}`);
  }

  return { migrated, skipped };
}

async function migrateGames() {
  const games = await Game.find({
    cover_url: { $exists: true, $nin: [null, ''] },
  });

  let migrated = 0;
  let skipped = 0;

  for (const game of games) {
    const fileName = extractUploadFileName(game.cover_url);

    if (!fileName) {
      skipped += 1;
      continue;
    }

    const uploadedUrl = await uploadLocalFile(fileName, 'gamesense/game-covers');
    game.cover_url = uploadedUrl;
    await game.save();
    migrated += 1;
    console.log(`Juego migrado: ${game.title} -> ${uploadedUrl}`);
  }

  return { migrated, skipped };
}

async function main() {
  await mongoose.connect(mongoUri);
  console.log('Conectado a MongoDB');

  const [usersResult, gamesResult] = await Promise.all([
    migrateUsers(),
    migrateGames(),
  ]);

  console.log('Resumen de migración:');
  console.log(`Usuarios migrados: ${usersResult.migrated}, omitidos: ${usersResult.skipped}`);
  console.log(`Juegos migrados: ${gamesResult.migrated}, omitidos: ${gamesResult.skipped}`);
}

main()
  .catch((error) => {
    console.error('Error migrando uploads:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });