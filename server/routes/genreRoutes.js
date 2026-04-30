const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');
const { requireAdmin } = require('../middleware/authMiddleware');

// GET /api/genres - Obtener todos los generos
router.get('/', genreController.getAllGenres);

// GET /api/genres/:id - Obtener detalle de un genero
router.get('/:id', genreController.getGenreById);

// POST /api/genres - Crear un nuevo genero
router.post('/', requireAdmin, genreController.createGenre);

// PUT /api/genres/:id - Editar un genero
router.put('/:id', requireAdmin, genreController.updateGenre);

// DELETE /api/genres/:id - Eliminar un genero
router.delete('/:id', requireAdmin, genreController.deleteGenre);

module.exports = router;
