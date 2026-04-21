const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const SystemLog = require('./models/SystemLog');

// Inicializar la aplicación
const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Permite recibir datos en formato JSON
app.use('/uploads', express.static('uploads'));

// Rutas de la API
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/reviews', reviewRoutes);

// Puerto y URI desde el archivo .env
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Conexión a MongoDB usando Mongoose (ORM)
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Conexión a la base de datos de GameSense establecida con éxito');
    
    // Iniciar el servidor solo si la conexión a la BD es exitosa
    app.listen(PORT, () => {
      console.log(`Servidor Back End corriendo en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error conectando a la base de datos:', error.message);
    // Más adelante, enviaremos este error a tu colección System_Logs
  });

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de GameSense funcionando correctamente');
});
