const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Ruta: POST /api/reviews (Publicar comentario)
router.post('/', reviewController.createReview);

// Ruta: GET /api/reviews/:gameId (Ver comentarios de un juego específico)
router.get('/:gameId', reviewController.getGameReviews);

// Ruta: PUT /api/reviews/:id (Editar una reseña propia)
router.put('/:id', reviewController.updateReview);

// Ruta: DELETE /api/reviews/:id (Borrar una reseña propia)
router.delete('/:id', reviewController.deleteReview);

module.exports = router;