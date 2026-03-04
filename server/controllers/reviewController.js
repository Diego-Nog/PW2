const Review = require('../models/Review'); // Importamos el ORM

// 1. Crear una nueva reseña (POST /)
exports.createReview = async (req, res) => {
    try {
        const { user_id, game_id, content, rating } = req.body;

        // --- VALIDACIONES INDEPENDIENTES (Rúbrica) ---
        if (!content || content.trim().length < 10) {
            return res.status(400).json({ message: "La reseña debe tener al menos 10 caracteres" });
        }

        if (!rating || rating < 1 || rating > 10) {
            return res.status(400).json({ message: "La calificación debe estar entre 1 y 10" });
        }

        // Crear la reseña mediante el ORM
        const newReview = new Review({
            user_id,
            game_id,
            content,
            rating
        });

        await newReview.save();

        res.status(201).json({
            message: "Reseña publicada exitosamente",
            review: newReview
        });

    } catch (error) {
        res.status(500).json({ message: "Error al publicar la reseña", error: error.message });
    }
};

// 2. Obtener reseñas de un juego específico (GET /:gameId)
exports.getGameReviews = async (req, res) => {
    try {
        // Usamos .populate para traer los datos del autor de la reseña
        const reviews = await Review.find({ game_id: req.params.gameId })
            .populate('user_id', 'username profile_pic')
            .sort({ date: -1 }); // Ordenar por las más recientes

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener reseñas", error: error.message });
    }
};

// 3. Eliminar una reseña (DELETE /:id)
exports.deleteReview = async (req, res) => {
    try {
        // Acción de eliminar mediante el ORM
        const deletedReview = await Review.findByIdAndDelete(req.params.id);

        if (!deletedReview) {
            return res.status(404).json({ message: "Reseña no encontrada" });
        }

        res.status(200).json({ message: "Reseña eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la reseña", error: error.message });
    }
};