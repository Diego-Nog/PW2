const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const genreRoutes = require('./routes/genreRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const reportRoutes = require('./routes/reportRoutes');
const SystemLog = require('./models/SystemLog');
const { authenticateToken } = require('./middleware/authMiddleware');

// Inicializar la aplicación
const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Puerto y URI desde el archivo .env
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Conexión a MongoDB con caché para Vercel serverless
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MONGO_URI);
  isConnected = true;
  console.log('Conexión a la base de datos de GameSense establecida con éxito');

  const collection = await mongoose.connection.db.listCollections({ name: 'libraries' }).toArray();
  if (collection.length === 0) {
    await mongoose.connection.db.createCollection('libraries');
    console.log('Coleccion libraries creada en MongoDB');
  }
}

// Middleware que asegura conexión a BD antes de cada request (necesario en serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Error conectando a la base de datos:', error.message);
    res.status(500).json({ message: 'Error de conexión a la base de datos' });
  }
});

// Rutas de la API
app.use('/api/users', userRoutes);
app.use('/api/games', authenticateToken, gameRoutes);
app.use('/api/reviews', authenticateToken, reviewRoutes);
app.use('/api/genres', authenticateToken, genreRoutes);
app.use('/api/library', authenticateToken, libraryRoutes);
app.use('/api/reports', authenticateToken, reportRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de GameSense funcionando correctamente');
});

// Iniciar servidor solo en entorno local (no serverless)
if (process.env.NODE_ENV !== 'production') {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Servidor Back End corriendo en el puerto ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Error conectando a la base de datos:', error.message);
    });
}

// Exportar para Vercel serverless
module.exports = app;
