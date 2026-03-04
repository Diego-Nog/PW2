const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Ruta: GET /api/games (Obtener catálogo completo)
router.get('/', gameController.getAllGames);

// Ruta: GET /api/games/:id (Detalle de un juego por su ID de MongoDB)
router.get('/:id', gameController.getGameById);

// Ruta: POST /api/games (Solo para que el Admin agregue juegos)
router.post('/', gameController.createGame);

module.exports = router;