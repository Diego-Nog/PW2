const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');

// GET /api/genres - Obtener todos los generos
router.get('/', genreController.getAllGenres);

// GET /api/genres/:id - Obtener detalle de un genero
router.get('/:id', genreController.getGenreById);

// POST /api/genres - Crear un nuevo genero
router.post('/', genreController.createGenre);

// PUT /api/genres/:id - Editar un genero
router.put('/:id', genreController.updateGenre);

// DELETE /api/genres/:id - Eliminar un genero
router.delete('/:id', genreController.deleteGenre);

module.exports = router;
