const Review = require('../models/Review'); // Importamos el ORM

// 1. Crear una nueva reseña (POST /)
exports.createReview = async (req, res) => {
    try {
        const { game_id, content, rating } = req.body;
        const user_id = req.user.id;

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

// 3. Editar una reseña propia (PUT /:id)
exports.updateReview = async (req, res) => {
    try {
        const { content, rating } = req.body;
        const user_id = req.user.id;

        if (!content || content.trim().length < 10) {
            return res.status(400).json({ message: "La reseña debe tener al menos 10 caracteres" });
        }

        if (!rating || rating < 1 || rating > 10) {
            return res.status(400).json({ message: "La calificación debe estar entre 1 y 10" });
        }

        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: "Reseña no encontrada" });
        }

        if (review.user_id.toString() !== user_id) {
            return res.status(403).json({ message: "No tienes permiso para editar esta reseña" });
        }

        review.content = content;
        review.rating = rating;
        review.date = new Date();

        await review.save();

        const populatedReview = await Review.findById(review._id)
            .populate('user_id', 'username profile_pic');

        return res.status(200).json({
            message: "Reseña actualizada correctamente",
            review: populatedReview
        });
    } catch (error) {
        return res.status(500).json({ message: "Error al editar la reseña", error: error.message });
    }
};

// 4. Eliminar una reseña (DELETE /:id)
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: "Reseña no encontrada" });
        }

        if (!req.user.is_admin && review.user_id.toString() !== req.user.id) {
            return res.status(403).json({ message: "No tienes permiso para eliminar esta reseña" });
        }

        const deletedReview = await Review.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Reseña eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la reseña", error: error.message });
    }
};