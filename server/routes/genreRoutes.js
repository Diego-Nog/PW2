const express = require('express');
const router = express.Router();
const Genre = require('../models/Genre');

// GET /api/genres - Obtener todos los géneros
router.get('/', async (req, res) => {
    try {
        const genres = await Genre.find().sort({ name: 1 });
        res.status(200).json({ genres });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener géneros', error: error.message });
    }
});

// GET /api/genres/:id - Obtener detalle de un género
router.get('/:id', async (req, res) => {
    try {
        const genre = await Genre.findById(req.params.id);
        if (!genre) return res.status(404).json({ message: 'Género no encontrado.' });
        res.status(200).json({ genre });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el género', error: error.message });
    }
});

// POST /api/genres - Crear un nuevo género
router.post('/', async (req, res) => {
    try {
        const { name, description, tags } = req.body;
        if (!name) return res.status(400).json({ message: 'El nombre del género es obligatorio.' });
        const exists = await Genre.findOne({ name });
        if (exists) return res.status(400).json({ message: 'Ya existe un género con ese nombre.' });
        const genre = new Genre({ name, description, tags });
        await genre.save();
        res.status(201).json({ message: 'Género creado exitosamente', genre });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el género', error: error.message });
    }
});

// PUT /api/genres/:id - Editar un género
router.put('/:id', async (req, res) => {
    try {
        const { name, description, tags } = req.body;
        if (!name) return res.status(400).json({ message: 'El nombre del género es obligatorio.' });

        const exists = await Genre.findOne({ name, _id: { $ne: req.params.id } });
        if (exists) return res.status(400).json({ message: 'Ya existe un género con ese nombre.' });

        const updatedGenre = await Genre.findByIdAndUpdate(
            req.params.id,
            { name, description, tags },
            { new: true, runValidators: true }
        );

        if (!updatedGenre) return res.status(404).json({ message: 'Género no encontrado.' });

        res.status(200).json({ message: 'Género actualizado exitosamente', genre: updatedGenre });
    } catch (error) {
        res.status(500).json({ message: 'Error al editar el género', error: error.message });
    }
});

module.exports = router;
